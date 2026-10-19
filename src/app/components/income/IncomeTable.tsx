import {AnnualIncome} from '../../../../lib/income/types';
import {formatYenAsManYen} from '../../../../lib/income/format';

interface IncomeTableProps {
    incomes: AnnualIncome[];
}

export default function IncomeTable({incomes}: IncomeTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="mb-3 text-left text-base font-semibold text-gray-800 dark:text-gray-200">
                    年別収入内訳（万円）
                </caption>
                <thead>
                <tr className="border-b border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                    <th className="px-3 py-3 text-left" scope="col">年</th>
                    <th className="px-3 py-3 text-right" scope="col">給与</th>
                    <th className="px-3 py-3 text-right" scope="col">配当金</th>
                    <th className="px-3 py-3 text-right" scope="col">その他</th>
                    <th className="px-3 py-3 text-right" scope="col">合計</th>
                </tr>
                </thead>
                <tbody>
                {incomes.map((income) => (
                    <tr
                        className="border-b border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                        key={income.year}
                    >
                        <th className="px-3 py-3 text-left font-medium" scope="row">
                            {income.year}年
                        </th>
                        <td className="px-3 py-3 text-right tabular-nums">
                            {formatYenAsManYen(income.salary)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                            {formatYenAsManYen(income.dividends)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                            {formatYenAsManYen(income.other)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                            {formatYenAsManYen(income.total)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
