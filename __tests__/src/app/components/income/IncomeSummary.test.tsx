import {render, screen} from '@testing-library/react';
import IncomeSummary from '../../../../../src/app/components/income/IncomeSummary';
import {AnnualIncome} from '../../../../../lib/income/types';

describe('IncomeSummary', () => {
    const incomes: AnnualIncome[] = [
        {year: 2016, salary: 4_000_000, dividends: 120_000, other: 0, total: 4_120_000},
        {year: 2017, salary: 4_350_000, dividends: 150_000, other: 80_000, total: 4_580_000},
    ];

    it('period, unit and three summary metrics reflect the supplied incomes', () => {
        render(<IncomeSummary incomes={incomes}/>);

        expect(screen.getByText('対象期間: 2016〜2017年')).toBeInTheDocument();
        expect(screen.getByText('最新年の合計')).toBeInTheDocument();
        expect(screen.getByText('458.0万円')).toBeInTheDocument();
        expect(screen.getByText('増加 +46.0万円')).toBeInTheDocument();
        expect(screen.getByText('増減率: 11.2%')).toBeInTheDocument();
        expect(screen.getByText('対象期間の合計')).toBeInTheDocument();
        expect(screen.getByText('870.0万円')).toBeInTheDocument();
    });

    it('shows the difference without a percentage when the previous total is zero', () => {
        render(
            <IncomeSummary
                incomes={[
                    {year: 2016, salary: 0, dividends: 0, other: 0, total: 0},
                    {year: 2017, salary: 100_000, dividends: 0, other: 0, total: 100_000},
                ]}
            />
        );

        expect(screen.getByText('増加 +10.0万円')).toBeInTheDocument();
        expect(screen.getByText('増減率: 算出不可')).toBeInTheDocument();
    });

    it('labels a decrease with text and a negative amount', () => {
        render(
            <IncomeSummary
                incomes={[
                    {year: 2016, salary: 200_000, dividends: 0, other: 0, total: 200_000},
                    {year: 2017, salary: 100_000, dividends: 0, other: 0, total: 100_000},
                ]}
            />
        );

        expect(screen.getByText('減少 -10.0万円')).toBeInTheDocument();
        expect(screen.getByText('増減率: -50.0%')).toBeInTheDocument();
    });
});
