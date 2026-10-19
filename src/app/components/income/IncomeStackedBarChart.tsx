'use client';

import {useEffect, useRef, useState} from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {AnnualIncome} from '../../../../lib/income/types';
import {formatManYen, formatManYenValue, yenToManYen} from '../../../../lib/income/format';

interface IncomeStackedBarChartProps {
    incomes: AnnualIncome[];
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        color?: string;
        name?: string | number;
        value?: number | string;
    }>;
    label?: number | string;
}

const SERIES_COLORS = {
    salary: 'var(--income-salary)',
    dividends: 'var(--income-dividends)',
    other: 'var(--income-other)',
};

function IncomeTooltip({active, payload, label}: ChartTooltipProps) {
    const incomePayload = payload?.filter((entry) => entry.name !== '合計');
    const totalPayload = payload?.find((entry) => entry.name === '合計');
    if (!active || !incomePayload?.length) {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
            <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{label}年</p>
            <ul className="space-y-1">
                {incomePayload.map((entry) => (
                    <li className="flex items-center justify-between gap-4" key={String(entry.name)}>
                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span
                                aria-hidden="true"
                                className="inline-block h-2.5 w-2.5 rounded-sm"
                                style={{backgroundColor: entry.color}}
                            />
                            {entry.name}
                        </span>
                        <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">
                            {formatManYen(Number(entry.value))}
                        </span>
                    </li>
                ))}
                {totalPayload && (
                    <li className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 font-semibold dark:border-gray-600">
                        <span className="text-gray-900 dark:text-gray-100">合計</span>
                        <span className="tabular-nums text-gray-900 dark:text-gray-100">
                            {formatManYen(Number(totalPayload.value))}
                        </span>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default function IncomeStackedBarChart({incomes}: IncomeStackedBarChartProps) {
    const scrollRegionRef = useRef<HTMLDivElement>(null);
    const [scrollEdges, setScrollEdges] = useState({left: false, right: false});
    const firstYear = Math.min(...incomes.map((income) => income.year));
    const lastYear = Math.max(...incomes.map((income) => income.year));
    const chartData = incomes.map((income) => ({
        year: income.year,
        salary: yenToManYen(income.salary),
        dividends: yenToManYen(income.dividends),
        other: yenToManYen(income.other),
        total: yenToManYen(income.total),
    }));
    const hasHorizontalOverflow = scrollEdges.left || scrollEdges.right;

    useEffect(() => {
        const scrollRegion = scrollRegionRef.current;
        if (!scrollRegion) {
            return;
        }

        const updateScrollEdges = () => {
            const nextEdges = {
                left: scrollRegion.scrollLeft > 0,
                right: scrollRegion.scrollLeft + scrollRegion.clientWidth < scrollRegion.scrollWidth - 1,
            };
            setScrollEdges((currentEdges) =>
                currentEdges.left === nextEdges.left && currentEdges.right === nextEdges.right
                    ? currentEdges
                    : nextEdges
            );
        };

        updateScrollEdges();
        scrollRegion.addEventListener('scroll', updateScrollEdges, {passive: true});
        window.addEventListener('resize', updateScrollEdges);
        const resizeObserver = typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(updateScrollEdges);
        resizeObserver?.observe(scrollRegion);

        return () => {
            scrollRegion.removeEventListener('scroll', updateScrollEdges);
            window.removeEventListener('resize', updateScrollEdges);
            resizeObserver?.disconnect();
        };
    }, []);

    return (
        <div
            aria-describedby="income-chart-description"
            aria-label={`${firstYear}年から${lastYear}年までの年別収入積み上げ棒グラフ`}
            className="focus-within:rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-blue-600"
            role="group"
        >
            <p className="sr-only" id="income-chart-description">
                給与、配当金、その他の手取り収入を万円単位で比較します。グラフ内は矢印キーで移動できます。正確な値は次の表でも確認できます。
            </p>
            {hasHorizontalOverflow && (
                <p className="mb-2 text-xs text-gray-600 dark:text-gray-300"
                   id="income-chart-scroll-instructions">
                    左右にスクロールして全期間を確認できます
                </p>
            )}
            <div className="relative">
                <div
                    aria-describedby={hasHorizontalOverflow ? 'income-chart-scroll-instructions' : undefined}
                    aria-label="グラフを左右にスクロール"
                    className="overflow-x-auto focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:focus-visible:outline-blue-300"
                    ref={scrollRegionRef}
                    role="region"
                    tabIndex={0}
                >
                    <div className="min-w-[640px]" style={{height: 360}}>
                        <ResponsiveContainer height="100%" width="100%">
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                margin={{top: 28, right: 20, bottom: 8, left: 12}}
                            >
                                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false}/>
                                <XAxis
                                    axisLine={{stroke: 'var(--chart-axis)'}}
                                    dataKey="year"
                                    tick={{fill: 'var(--chart-tick)', fontSize: 12}}
                                    tickLine={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    label={{angle: -90, fill: 'var(--chart-tick)', position: 'insideLeft', value: '万円'}}
                                    tick={{fill: 'var(--chart-tick)', fontSize: 12}}
                                    tickFormatter={(value) => formatManYenValue(Number(value))}
                                    tickLine={false}
                                    width={52}
                                />
                                <Tooltip content={<IncomeTooltip/>}/>
                                <Legend
                                    formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
                                    verticalAlign="top"
                                />
                                <Bar dataKey="salary" fill={SERIES_COLORS.salary} name="給与" stackId="income"/>
                                <Bar dataKey="dividends" fill={SERIES_COLORS.dividends} name="配当金" stackId="income"/>
                                <Bar dataKey="other" fill={SERIES_COLORS.other} name="その他" stackId="income"/>
                                <Line
                                    dataKey="total"
                                    dot={false}
                                    isAnimationActive={false}
                                    legendType="none"
                                    name="合計"
                                    stroke="transparent"
                                >
                                    <LabelList
                                        dataKey="total"
                                        fill="var(--chart-total)"
                                        formatter={(value) => formatManYenValue(Number(value))}
                                        position="top"
                                    />
                                </Line>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {scrollEdges.left && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-white to-transparent dark:from-gray-800"
                    />
                )}
                {scrollEdges.right && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-white to-transparent dark:from-gray-800"
                    />
                )}
            </div>
        </div>
    );
}
