import IncomeStackedBarChart from './components/income/IncomeStackedBarChart';
import IncomeSummary from './components/income/IncomeSummary';
import IncomeTable from './components/income/IncomeTable';
import {createIncomeRepository} from '../../lib/income/repositories/createIncomeRepository';
import {IncomeCsvValidationError, IncomeDataReadError} from '../../lib/income/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
    let incomes;
    try {
        incomes = await createIncomeRepository().getAnnualIncomes();
    } catch (error) {
        if (error instanceof IncomeCsvValidationError) {
            return (
                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        収入推移
                    </h2>
                    <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                       role="alert">
                        収入データに不備があります。{error.message}
                    </p>
                </main>
            );
        }

        if (error instanceof IncomeDataReadError) {
            console.error('サンプル収入データの読み込みに失敗しました。', error.originalError);
            return (
                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        収入推移
                    </h2>
                    <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                       role="alert">
                        サンプル収入データを読み込めませんでした。
                    </p>
                </main>
            );
        }

        throw error;
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="space-y-8">
                <div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                        収入推移
                    </h2>
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                        給与、配当金、その他の税引後収入を年ごとに比較できます。金額は万円単位で表示しています。
                    </p>
                </div>

                <IncomeSummary incomes={incomes}/>

                <section
                    aria-labelledby="income-chart-heading"
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                >
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
                        id="income-chart-heading">
                        収入内訳と年合計
                    </h3>
                    <p className="mb-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        棒の高さは年ごとの合計、色分けは収入区分を示します。
                    </p>
                    <IncomeStackedBarChart incomes={incomes}/>
                    <a
                        className="mt-4 inline-flex rounded text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-blue-300 dark:hover:text-blue-200 dark:focus-visible:outline-blue-300"
                        href="#income-table"
                    >
                        数値を表で見る
                    </a>
                </section>

                <section
                    aria-labelledby="income-table-heading"
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                    id="income-table"
                >
                    <h3 className="sr-only" id="income-table-heading">年別収入データ</h3>
                    <IncomeTable incomes={incomes}/>
                </section>
            </div>
        </main>
    );
}
