import {AnnualIncome} from '../types';

export interface IncomeRepository {
    getAnnualIncomes(): Promise<AnnualIncome[]>;
}
