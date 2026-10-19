import {CsvIncomeRepository} from './CsvIncomeRepository';
import {IncomeRepository} from './IncomeRepository';

export function createIncomeRepository(): IncomeRepository {
    return new CsvIncomeRepository();
}
