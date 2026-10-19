export interface AnnualIncome {
    year: number;
    salary: number;
    dividends: number;
    other: number;
    total: number;
}

export class IncomeCsvValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IncomeCsvValidationError';
    }
}

export class IncomeDataReadError extends Error {
    constructor(readonly originalError: unknown) {
        super('サンプル収入データを読み込めませんでした。');
        this.name = 'IncomeDataReadError';
    }
}
