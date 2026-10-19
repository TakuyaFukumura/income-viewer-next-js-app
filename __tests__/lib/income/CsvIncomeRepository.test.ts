import path from 'node:path';
import {CsvIncomeRepository} from '../../../lib/income/repositories/CsvIncomeRepository';
import {IncomeDataReadError} from '../../../lib/income/types';

describe('CsvIncomeRepository', () => {
    it('リポジトリ内のサンプルCSVを読み込む', async () => {
        const incomes = await new CsvIncomeRepository().getAnnualIncomes();

        expect(incomes).toHaveLength(10);
        expect(incomes[0].year).toBe(2016);
        expect(incomes[9].year).toBe(2025);
    });

    it('CSVを読み込めない場合に型付きエラーを返す', async () => {
        const repository = new CsvIncomeRepository(path.join(process.cwd(), 'missing-income.csv'));

        await expect(repository.getAnnualIncomes()).rejects.toBeInstanceOf(IncomeDataReadError);
    });
});
