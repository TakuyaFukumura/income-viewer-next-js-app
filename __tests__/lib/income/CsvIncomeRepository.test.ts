import path from 'node:path';
import {CsvIncomeRepository} from '../../../lib/income/repositories/CsvIncomeRepository';
import {IncomeDataReadError} from '../../../lib/income/types';

describe('CsvIncomeRepository', () => {
    it('リポジトリ内のサンプルCSVを読み込む', async () => {
        const incomes = await new CsvIncomeRepository().getAnnualIncomes();

        expect(incomes).toHaveLength(10);
        expect(incomes[0]).toMatchObject({year: 2016, dividends: 0});
        expect(incomes[1]).toMatchObject({year: 2017, dividends: 0});
        expect(incomes[2]).toMatchObject({year: 2018, dividends: 0});
        expect(incomes[3]).toMatchObject({year: 2019, dividends: 759});
        expect(incomes[4]).toMatchObject({year: 2020, dividends: 3_886});
        expect(incomes[5]).toMatchObject({year: 2021, salary: 2_129_200, dividends: 10_381});
        expect(incomes[6]).toMatchObject({year: 2022, salary: 2_146_000, dividends: 110_570});
        expect(incomes[7]).toMatchObject({year: 2023, salary: 2_179_600, dividends: 258_490});
        expect(incomes[8]).toMatchObject({year: 2024, salary: 2_406_400, dividends: 312_859});
        expect(incomes[9]).toMatchObject({year: 2025, salary: 2_804_800, dividends: 365_370});
    });

    it('CSVを読み込めない場合に型付きエラーを返す', async () => {
        const repository = new CsvIncomeRepository(path.join(process.cwd(), 'missing-income.csv'));

        await expect(repository.getAnnualIncomes()).rejects.toBeInstanceOf(IncomeDataReadError);
    });
});
