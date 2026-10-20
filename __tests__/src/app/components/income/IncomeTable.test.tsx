import {render, screen, within} from '@testing-library/react';
import IncomeTable from '../../../../../src/app/components/income/IncomeTable';
import {AnnualIncome} from '../../../../../lib/income/types';

describe('IncomeTable', () => {
    it('各収入区分の金額と年合計に占める割合を表示する', () => {
        const incomes: AnnualIncome[] = [
            {year: 2025, salary: 4_350_000, dividends: 150_000, other: 80_000, total: 4_580_000},
        ];

        render(<IncomeTable incomes={incomes}/>);

        const table = screen.getByRole('table', {
            name: '年別収入内訳（万円・税引後、各区分の構成比）',
        });
        const row = within(table).getByRole('row', {
            name: /2025年 435.0万円 構成比: 95.0% 15.0万円 構成比: 3.3% 8.0万円 構成比: 1.7% 458.0万円/,
        });

        expect(row).toBeInTheDocument();
    });

    it('合計が0円の場合は構成比を算出不可として表示する', () => {
        const incomes: AnnualIncome[] = [
            {year: 2025, salary: 0, dividends: 0, other: 0, total: 0},
        ];

        render(<IncomeTable incomes={incomes}/>);

        expect(screen.getAllByText('構成比: 算出不可')).toHaveLength(3);
    });
});
