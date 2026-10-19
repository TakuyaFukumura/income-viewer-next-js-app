const manYenFormatter = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

export function yenToManYen(yen: number): number {
    return yen / 10_000;
}

export function formatManYen(manYen: number): string {
    return `${formatManYenValue(manYen)}万円`;
}

export function formatManYenValue(manYen: number): string {
    return manYenFormatter.format(manYen);
}

export function formatYenAsManYen(yen: number): string {
    return formatManYen(yenToManYen(yen));
}
