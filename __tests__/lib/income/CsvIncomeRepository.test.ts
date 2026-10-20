import path from 'node:path';
import {CsvIncomeRepository} from '../../../lib/income/repositories/CsvIncomeRepository';
import {IncomeDataReadError} from '../../../lib/income/types';

describe('CsvIncomeRepository', () => {
    it('リポジトリ内のサンプルCSVを読み込む', async () => {
        const incomes = await new CsvIncomeRepository().getAnnualIncomes();

        expect(incomes).toHaveLength(10);
        expect(incomes[0].year).toBe(2016);
        expect(incomes[4]).toMatchObject({year: 2020, dividends: 3_886});
        expect(incomes[5]).toMatchObject({year: 2021, dividends: 10_381});
        expect(incomes[6]).toMatchObject({year: 2022, dividends: 110_570});
        expect(incomes[7]).toMatchObject({year: 2023, dividends: 258_490});
        expect(incomes[8]).toMatchObject({year: 2024, dividends: 312_859});
        expect(incomes[9]).toMatchObject({year: 2025, dividends: 365_370});
    });

    it('CSVを読み込めない場合に型付きエラーを返す', async () => {
        const repository = new CsvIncomeRepository(path.join(process.cwd(), 'missing-income.csv'));

        await expect(repository.getAnnualIncomes()).rejects.toBeInstanceOf(IncomeDataReadError);
    });
});
