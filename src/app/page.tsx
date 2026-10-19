import IncomeStackedBarChart from './components/income/IncomeStackedBarChart';
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
                        年別収入の推移
                    </h2>
                    <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
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
                        年別収入の推移
                    </h2>
                    <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
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
                        年別収入の推移
                    </h2>
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                        給与、配当金、その他の税引後収入を年ごとに比較できます。金額は万円単位で表示しています。
                    </p>
                </div>

                <section
                    aria-labelledby="income-chart-heading"
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                >
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100" id="income-chart-heading">
                        収入内訳と年合計
                    </h3>
                    <IncomeStackedBarChart incomes={incomes}/>
                </section>

                <section
                    aria-labelledby="income-table-heading"
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                >
                    <h3 className="sr-only" id="income-table-heading">年別収入データ</h3>
                    <IncomeTable incomes={incomes}/>
                </section>
            </div>
        </main>
    );
}
