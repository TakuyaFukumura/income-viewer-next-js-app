import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parseIncomeCsv} from '../parse-income-csv';
import {IncomeDataReadError} from '../types';
import {IncomeRepository} from './IncomeRepository';

export class CsvIncomeRepository implements IncomeRepository {
    constructor(private readonly csvPath = path.join(process.cwd(), 'data', 'income.csv')) {
    }

    async getAnnualIncomes() {
        let csv: string;
        try {
            csv = await readFile(this.csvPath, 'utf8');
        } catch (error) {
            throw new IncomeDataReadError(error);
        }
        return parseIncomeCsv(csv);
    }
}
