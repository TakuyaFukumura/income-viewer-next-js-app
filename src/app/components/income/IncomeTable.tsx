import {AnnualIncome} from '../../../../lib/income/types';
import {formatYenAsManYen} from '../../../../lib/income/format';

interface IncomeTableProps {
    readonly incomes: readonly AnnualIncome[];
}

const percentageFormatter = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

function formatIncomeShare(amount: number, total: number): string {
    if (total === 0) {
        return '構成比: 算出不可';
    }

    return `構成比: ${percentageFormatter.format((amount / total) * 100)}%`;
}

export default function IncomeTable({incomes}: IncomeTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="mb-3 text-left text-base font-semibold text-gray-800 dark:text-gray-200">
                    年別収入内訳（万円・税引後、各区分の構成比）
                </caption>
                <thead>
                <tr className="border-b border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                    <th
                        className="sticky left-0 z-20 border-r border-gray-200 bg-white px-3 py-3 text-left dark:border-gray-700 dark:bg-gray-800"
                        scope="col"
                    >
                        年
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 text-right" scope="col">給与</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right" scope="col">配当金</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right" scope="col">その他</th>
                    <th className="whitespace-nowrap bg-gray-50 px-3 py-3 text-right font-semibold dark:bg-gray-700"
                        scope="col">
                        合計
                    </th>
                </tr>
                </thead>
                <tbody>
                {incomes.map((income) => (
                    <tr
                        className="group border-b border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 focus-within:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-within:bg-blue-950"
                        key={income.year}
                    >
                        <th
                            className="sticky left-0 z-10 border-r border-gray-200 bg-white px-3 py-3 text-left font-medium group-hover:bg-gray-50 group-focus-within:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:group-hover:bg-gray-700 dark:group-focus-within:bg-blue-950 dark:focus-visible:outline-blue-300"
                            scope="row"
                            tabIndex={0}
                        >
                            {income.year}年
                        </th>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                            <p>{formatYenAsManYen(income.salary)}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {formatIncomeShare(income.salary, income.total)}
                            </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                            <p>{formatYenAsManYen(income.dividends)}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {formatIncomeShare(income.dividends, income.total)}
                            </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                            <p>{formatYenAsManYen(income.other)}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {formatIncomeShare(income.other, income.total)}
                            </p>
                        </td>
                        <td className="whitespace-nowrap bg-gray-50 px-3 py-3 text-right font-semibold tabular-nums group-hover:bg-gray-100 group-focus-within:bg-blue-50 dark:bg-gray-700 dark:group-hover:bg-gray-700 dark:group-focus-within:bg-blue-950">
                            {formatYenAsManYen(income.total)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
