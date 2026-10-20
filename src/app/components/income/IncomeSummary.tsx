import {AnnualIncome} from '../../../../lib/income/types';
import {formatYenAsManYen} from '../../../../lib/income/format';

interface IncomeSummaryProps {
    readonly incomes: readonly AnnualIncome[];
}

interface IncomeChangeDetails {
    difference: number | null;
    percentageChange: string | null;
    changeDescription: string;
    changeColor: string;
    signedDifference: string | null;
}

const percentageFormatter = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

function getChangeDescription(difference: number | null): string {
    if (difference === null) {
        return '前年データがありません';
    }
    if (difference > 0) {
        return '増加';
    }
    if (difference < 0) {
        return '減少';
    }
    return '変化なし';
}

function getChangeColor(difference: number | null): string {
    if (difference === null || difference === 0) {
        return 'text-gray-700 dark:text-gray-200';
    }
    if (difference > 0) {
        return 'text-emerald-700 dark:text-emerald-300';
    }
    return 'text-rose-700 dark:text-rose-300';
}

function getSignedDifference(difference: number | null): string | null {
    if (difference === null) {
        return null;
    }
    const formattedDifference = formatYenAsManYen(difference);
    return difference > 0 ? `+${formattedDifference}` : formattedDifference;
}

function getIncomeChangeDetails(
    latestIncome: AnnualIncome,
    previousIncome: AnnualIncome | undefined
): IncomeChangeDetails {
    const difference = previousIncome ? latestIncome.total - previousIncome.total : null;
    const percentageChange = previousIncome && previousIncome.total > 0 && difference !== null
        ? percentageFormatter.format((difference / previousIncome.total) * 100)
        : null;

    return {
        difference,
        percentageChange,
        changeDescription: getChangeDescription(difference),
        changeColor: getChangeColor(difference),
        signedDifference: getSignedDifference(difference),
    };
}

export default function IncomeSummary({incomes}: IncomeSummaryProps) {
    if (incomes.length === 0) {
        throw new Error('収入データがありません。');
    }

    const latestIncome = incomes.reduce(
        (latest, income) => income.year > latest.year ? income : latest,
        incomes[0]
    );
    const previousIncome = incomes.find((income) => income.year === latestIncome.year - 1);
    const periodStart = Math.min(...incomes.map((income) => income.year));
    const periodEnd = Math.max(...incomes.map((income) => income.year));
    const periodTotal = incomes.reduce((total, income) => total + income.total, 0);
    const {difference, percentageChange, changeDescription, changeColor, signedDifference} =
        getIncomeChangeDetails(latestIncome, previousIncome);

    return (
        <section aria-label="収入の概要">
            <div className="mb-4 flex flex-wrap gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                    対象期間: {periodStart}〜{periodEnd}年
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">税引後</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">単位: 万円</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">最新年の合計</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{latestIncome.year}年</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                        {formatYenAsManYen(latestIncome.total)}
                    </p>
                </article>

                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">前年からの増減</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {previousIncome ? `${previousIncome.year}年との比較` : `${latestIncome.year}年`}
                    </p>
                    {difference === null ? (
                        <p className="mt-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
                            {changeDescription}
                        </p>
                    ) : (
                        <>
                            <p className={`mt-1 text-2xl font-semibold tabular-nums ${changeColor}`}>
                                {changeDescription} {signedDifference}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                増減率: {percentageChange === null ? '算出不可' : `${percentageChange}%`}
                            </p>
                        </>
                    )}
                </article>

                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:col-span-2 lg:col-span-1">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">対象期間の合計</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{periodStart}〜{periodEnd}年</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                        {formatYenAsManYen(periodTotal)}
                    </p>
                </article>
            </div>
        </section>
    );
}
