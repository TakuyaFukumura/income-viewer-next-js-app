import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import IncomeStackedBarChart, {IncomeTooltip} from '../../../../../src/app/components/income/IncomeStackedBarChart';

class TestResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {
    }

    observe(target: Element) {
        const contentRect = {
            bottom: 360,
            height: 360,
            left: 0,
            right: 760,
            top: 0,
            width: 760,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } satisfies DOMRectReadOnly;

        this.callback([{
            borderBoxSize: [],
            contentBoxSize: [],
            contentRect,
            devicePixelContentBoxSize: [],
            target,
        }], this as ResizeObserver);
    }

    unobserve() {
    }

    disconnect() {
    }
}

describe('IncomeStackedBarChart', () => {
    const originalResizeObserver = globalThis.ResizeObserver;

    beforeEach(() => {
        globalThis.ResizeObserver = TestResizeObserver;
    });

    afterEach(() => {
        globalThis.ResizeObserver = originalResizeObserver;
    });

    it('ツールチップに収入区分と合計を表示する', () => {
        render(
            <IncomeTooltip
                active
                label={2016}
                payload={[
                    {name: '給与', value: 40, color: '#2563eb'},
                    {name: '配当金', value: 10, color: '#059669'},
                    {name: 'その他', value: 0, color: '#9333ea'},
                    {name: '合計', value: 50},
                ]}
            />
        );

        expect(screen.getByText('2016年')).toBeInTheDocument();
        expect(screen.getByText('合計')).toBeInTheDocument();
        expect(screen.getByText('50.0万円')).toBeInTheDocument();
    });

    it('3系列、年合計ラベルを表示し、キーボードで年を移動できる', async () => {
        render(
            <IncomeStackedBarChart
                incomes={[
                    {year: 2016, salary: 400_000, dividends: 100_000, other: 0, total: 500_000},
                    {year: 2017, salary: 410_000, dividends: 100_000, other: 0, total: 510_000},
                ]}
            />
        );

        expect(screen.getByRole('group', {
            name: '2016年から2017年までの年別収入積み上げ棒グラフ',
        })).toHaveAttribute('aria-describedby', 'income-chart-description');
        expect(await screen.findByText('給与')).toBeInTheDocument();
        expect(screen.getByText('配当金')).toBeInTheDocument();
        expect(screen.getByText('その他')).toBeInTheDocument();
        expect(screen.getByText('50.0')).toBeInTheDocument();

        const chart = await screen.findByRole('application');
        act(() => {
            chart.focus();
            fireEvent.keyDown(chart, {key: 'ArrowRight'});
        });

        await waitFor(() => {
            expect(screen.getByText('2017年')).toBeInTheDocument();
        });
        expect(screen.getByText('41.0万円')).toBeInTheDocument();
    });

    it('横スクロールの案内を表示し、スクロール領域をキーボードでフォーカスできる', async () => {
        const {container} = render(
            <IncomeStackedBarChart
                incomes={[
                    {year: 2016, salary: 400_000, dividends: 100_000, other: 0, total: 500_000},
                    {year: 2017, salary: 410_000, dividends: 100_000, other: 0, total: 510_000},
                ]}
            />
        );

        const scrollRegion = screen.getByRole('region', {name: 'グラフを左右にスクロール'});
        expect(scrollRegion).toHaveAttribute('tabindex', '0');
        Object.defineProperties(scrollRegion, {
            clientWidth: {configurable: true, value: 400},
            scrollWidth: {configurable: true, value: 900},
        });
        fireEvent.scroll(scrollRegion);

        expect(await screen.findByText('左右にスクロールして全期間を確認できます')).toBeInTheDocument();
        await waitFor(() => {
            expect(container.querySelector('.bg-gradient-to-l')).toBeInTheDocument();
        });
        Object.defineProperty(scrollRegion, 'scrollLeft', {configurable: true, value: 100});
        fireEvent.scroll(scrollRegion);
        await waitFor(() => {
            expect(container.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
        });
        scrollRegion.focus();
        expect(scrollRegion).toHaveFocus();
    });
});
