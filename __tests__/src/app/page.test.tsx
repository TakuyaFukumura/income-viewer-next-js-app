import {render, screen, within} from '@testing-library/react';
import Home from '../../../src/app/page';
import {createIncomeRepository} from '../../../lib/income/repositories/createIncomeRepository';
import {IncomeCsvValidationError, IncomeDataReadError} from '../../../lib/income/types';

jest.mock('../../../lib/income/repositories/createIncomeRepository', () => ({
    createIncomeRepository: jest.fn(),
}));

const sampleIncomes = [
    {year: 2016, salary: 4_000_000, dividends: 120_000, other: 0, total: 4_120_000},
    {year: 2017, salary: 4_350_000, dividends: 150_000, other: 80_000, total: 4_580_000},
];

const mockedCreateIncomeRepository = jest.mocked(createIncomeRepository);

describe('Home page', () => {
    beforeEach(() => {
        mockedCreateIncomeRepository.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('収入の説明、グラフ、同じ値を示す表を表示する', async () => {
        mockedCreateIncomeRepository.mockReturnValue({
            getAnnualIncomes: jest.fn().mockResolvedValue(sampleIncomes),
        });

        render(await Home());

        expect(screen.getByRole('heading', {name: '収入推移'})).toBeInTheDocument();
        expect(screen.getByText(/税引後収入/)).toBeInTheDocument();
        expect(screen.getByText('棒の高さは年ごとの合計、色分けは収入区分を示します。')).toBeInTheDocument();
        expect(screen.getByRole('link', {name: '数値を表で見る'})).toHaveAttribute('href', '#income-table');
        expect(screen.getByRole('group', {name: /年別収入積み上げ棒グラフ/})).toBeInTheDocument();
        const table = screen.getByRole('table', {name: '年別収入内訳（万円・税引後）'});
        expect(table).toBeInTheDocument();
        const firstRow = within(table).getByRole('row', {
            name: /2016年 400.0万円 12.0万円 0.0万円 412.0万円/,
        });
        expect(firstRow).toBeInTheDocument();
        const yearCell = within(firstRow).getByRole('rowheader', {name: '2016年'});
        yearCell.focus();
        expect(yearCell).toHaveFocus();
        expect(yearCell).toHaveClass('sticky', 'left-0');
    });

    it('CSV検証エラー時はグラフと表を表示せず詳細を通知する', async () => {
        mockedCreateIncomeRepository.mockReturnValue({
            getAnnualIncomes: jest.fn().mockRejectedValue(
                new IncomeCsvValidationError('CSV 2行目の「salary」列: 金額を入力してください。')
            ),
        });

        render(await Home());

        expect(screen.getByRole('alert')).toHaveTextContent('CSV 2行目の「salary」列');
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.queryByRole('group', {name: /年別収入積み上げ棒グラフ/})).not.toBeInTheDocument();
    });

    it('ファイル読み込みエラー時は一般化したエラーを表示する', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
        });
        mockedCreateIncomeRepository.mockReturnValue({
            getAnnualIncomes: jest.fn().mockRejectedValue(new IncomeDataReadError(new Error('private detail'))),
        });

        render(await Home());

        expect(screen.getByRole('alert')).toHaveTextContent('サンプル収入データを読み込めませんでした。');
        expect(screen.getByRole('alert')).not.toHaveTextContent('private detail');
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
