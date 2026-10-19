'use client';

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
    salary: '#2563eb',
    dividends: '#059669',
    other: '#9333ea',
};

function IncomeTooltip({active, payload, label}: ChartTooltipProps) {
    const incomePayload = payload?.filter((entry) => entry.name !== '合計');
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
            </ul>
        </div>
    );
}

export default function IncomeStackedBarChart({incomes}: IncomeStackedBarChartProps) {
    const chartData = incomes.map((income) => ({
        year: income.year,
        salary: yenToManYen(income.salary),
        dividends: yenToManYen(income.dividends),
        other: yenToManYen(income.other),
        total: yenToManYen(income.total),
    }));

    return (
        <div
            aria-describedby="income-chart-description"
            aria-label="2016年から2025年までの年別収入積み上げ棒グラフ"
            className="focus-within:rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-blue-600"
            role="group"
        >
            <p className="sr-only" id="income-chart-description">
                給与、配当金、その他の手取り収入を万円単位で比較します。グラフ内は矢印キーで移動できます。正確な値は次の表でも確認できます。
            </p>
            <div className="overflow-x-auto">
                <div className="min-w-[640px]" style={{height: 360}}>
                    <ResponsiveContainer height="100%" width="100%">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            margin={{top: 28, right: 20, bottom: 8, left: 12}}
                        >
                            <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical={false}/>
                            <XAxis
                                axisLine={{stroke: '#6b7280'}}
                                dataKey="year"
                                tick={{fill: '#4b5563', fontSize: 12}}
                                tickLine={false}
                            />
                            <YAxis
                                axisLine={false}
                                label={{angle: -90, fill: '#4b5563', position: 'insideLeft', value: '万円'}}
                                tick={{fill: '#4b5563', fontSize: 12}}
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
                                    className="fill-gray-900 dark:fill-gray-100"
                                    formatter={(value) => formatManYen(Number(value))}
                                    position="top"
                                />
                            </Line>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
