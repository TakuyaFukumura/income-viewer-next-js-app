import {parse} from 'csv-parse/sync';
import {AnnualIncome, IncomeCsvValidationError} from './types';

const EXPECTED_HEADER = ['year', 'salary', 'dividends', 'other'];
const FIRST_YEAR = 2016;
const LAST_YEAR = 2025;

const fail = (line: number, reason: string, column?: string): never => {
    const location = column ? `の「${column}」列` : '';
    throw new IncomeCsvValidationError(`CSV ${line}行目${location}: ${reason}`);
};

const getParserLine = (error: unknown): number => {
    if (typeof error === 'object' && error !== null && 'lines' in error) {
        const lines = error.lines;
        if (typeof lines === 'number' && Number.isInteger(lines) && lines > 0) {
            return lines;
        }
    }
    return 1;
};

export function parseIncomeCsv(csv: string): AnnualIncome[] {
    let records: string[][] = [];
    try {
        records = parse(csv, {
            bom: true,
            relax_column_count: true,
            skip_empty_lines: false,
        });
    } catch (error) {
        fail(getParserLine(error), 'CSV形式が不正です。');
    }

    const header = records[0];
    if (!header || header.length !== EXPECTED_HEADER.length
        || header.some((column, index) => column !== EXPECTED_HEADER[index])) {
        fail(1, `ヘッダーは「${EXPECTED_HEADER.join(',')}」である必要があります。`);
    }

    const incomes: AnnualIncome[] = [];
    const seenYears = new Set<number>();
    const expectedRowCount = LAST_YEAR - FIRST_YEAR + 1;

    for (let index = 1; index < records.length; index += 1) {
        const line = index + 1;
        const row = records[index];

        if (row.length === 1 && row[0] === '') {
            fail(line, '空行は使用できません。');
        }

        if (row.length !== EXPECTED_HEADER.length) {
            const missingColumn = row.length < EXPECTED_HEADER.length
                ? EXPECTED_HEADER[row.length]
                : undefined;
            fail(
                line,
                `列数が不正です（${EXPECTED_HEADER.length}列必要ですが${row.length}列です）。`,
                missingColumn
            );
        }

        const yearValue = row[0];
        if (!/^\d{4}$/.test(yearValue)) {
            fail(line, '年は4桁の西暦で指定してください。', 'year');
        }
        const year = Number(yearValue);
        if (year < FIRST_YEAR || year > LAST_YEAR) {
            fail(line, `${FIRST_YEAR}年から${LAST_YEAR}年の範囲で指定してください。`, 'year');
        }
        if (seenYears.has(year)) {
            fail(line, `${year}年が重複しています。`, 'year');
        }

        const expectedYear = FIRST_YEAR + incomes.length;
        if (year !== expectedYear) {
            fail(line, `${expectedYear}年の次に${year}年が指定されています。`, 'year');
        }
        seenYears.add(year);

        const amounts = row.slice(1).map((value, amountIndex) => {
            const column = EXPECTED_HEADER[amountIndex + 1];
            if (value === '') {
                fail(line, '金額を入力してください。', column);
            }
            if (!/^\d+$/.test(value)) {
                fail(line, '0以上の10進整数を入力してください。', column);
            }
            const amount = Number(value);
            if (!Number.isSafeInteger(amount)) {
                fail(line, '金額はJavaScriptの安全な整数の範囲内で指定してください。', column);
            }
            return amount;
        });

        const [salary, dividends, other] = amounts;
        const total = salary + dividends + other;
        if (!Number.isSafeInteger(total)) {
            fail(line, '収入の合計が安全な整数の範囲を超えています。', '合計');
        }

        incomes.push({year, salary, dividends, other, total});
        if (incomes.length > expectedRowCount) {
            fail(line, `${FIRST_YEAR}年から${LAST_YEAR}年までの10年分を超えています。`, 'year');
        }
    }

    if (incomes.length !== expectedRowCount) {
        const missingYear = FIRST_YEAR + incomes.length;
        fail(records.length + 1, `${missingYear}年のデータ行がありません。`, 'year');
    }

    return incomes;
}
