import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import IncomeStackedBarChart from '../../../../../src/app/components/income/IncomeStackedBarChart';

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

    it('3系列、年合計ラベルを表示し、キーボードで年を移動できる', async () => {
        render(
            <IncomeStackedBarChart
                incomes={[
                    {year: 2016, salary: 400_000, dividends: 100_000, other: 0, total: 500_000},
                    {year: 2017, salary: 410_000, dividends: 100_000, other: 0, total: 510_000},
                ]}
            />
        );

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
});
