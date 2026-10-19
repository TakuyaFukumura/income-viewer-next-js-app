import {parseIncomeCsv} from '../../../lib/income/parse-income-csv';

const createRecords = (): string[][] => [
    ['year', 'salary', 'dividends', 'other'],
    ...Array.from({length: 10}, (_, index) => [
        String(2016 + index),
        String(4_000_000 + index * 100_000),
        String(index * 10_000),
        String(index * 20_000),
    ]),
];

const toCsv = (records: string[][]): string => records.map((row) => row.join(',')).join('\n');

describe('parseIncomeCsv', () => {
    it('10年分の収入を円単位で読み込み、合計を計算する', () => {
        const incomes = parseIncomeCsv(toCsv(createRecords()));

        expect(incomes).toHaveLength(10);
        expect(incomes[0]).toEqual({
            year: 2016,
            salary: 4_000_000,
            dividends: 0,
            other: 0,
            total: 4_000_000,
        });
        expect(incomes[9]).toMatchObject({year: 2025, total: 5_170_000});
    });

    it('UTF-8 BOM付きのCSVを読み込む', () => {
        const incomes = parseIncomeCsv(`\uFEFF${toCsv(createRecords())}`);

        expect(incomes[0].year).toBe(2016);
    });

    it('ヘッダーの列名や順序が異なるCSVを拒否する', () => {
        const records = createRecords();
        records[0] = ['year', 'dividends', 'salary', 'other'];

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('CSV 1行目');
    });

    it.each([
        ['列が不足', ['2016', '4000000', '0']],
        ['列が過剰', ['2016', '4000000', '0', '0', 'extra']],
    ])('%s行を拒否する', (_description, row) => {
        const records = createRecords();
        records[1] = row;

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('CSV 2行目');
    });

    it('金額の空欄を行番号と列名付きで拒否する', () => {
        const records = createRecords();
        records[1][2] = '';

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('CSV 2行目の「dividends」列');
    });

    it.each(['12.5', 'abc', '-100', '1e4'])('不正な金額「%s」を拒否する', (amount) => {
        const records = createRecords();
        records[1][3] = amount;

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('CSV 2行目の「other」列');
    });

    it('安全な整数の範囲を超える金額を拒否する', () => {
        const records = createRecords();
        records[1][1] = '9007199254740992';

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('安全な整数');
    });

    it('重複した年を拒否する', () => {
        const records = createRecords();
        records[2][0] = '2016';

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('2016年が重複しています');
    });

    it('昇順でない年を拒否する', () => {
        const records = createRecords();
        records[2][0] = '2018';

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('2017年の次に2018年');
    });

    it('範囲外の年を拒否する', () => {
        const records = createRecords();
        records[1][0] = '2026';

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('CSV 2行目の「year」列');
    });

    it('不足している年を示して拒否する', () => {
        const records = createRecords();
        records.pop();

        expect(() => parseIncomeCsv(toCsv(records))).toThrow('2025年のデータ行がありません');
    });

    it('空行を行番号付きで拒否する', () => {
        const csv = `${toCsv(createRecords().slice(0, 3))}\n\n${toCsv(createRecords().slice(3))}`;

        expect(() => parseIncomeCsv(csv)).toThrow('CSV 4行目');
    });
});
