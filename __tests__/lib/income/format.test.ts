import {formatManYen, formatManYenValue, formatYenAsManYen, yenToManYen,} from '../../../lib/income/format';

describe('income format helpers', () => {
    it('円を万円に変換する', () => {
        expect(yenToManYen(1_234_567)).toBe(123.4567);
    });

    it('万円表示を小数点以下1桁に整える', () => {
        expect(formatYenAsManYen(1_234_567)).toBe('123.5万円');
        expect(formatManYen(1_234.56)).toBe('1,234.6万円');
        expect(formatManYenValue(1_234.56)).toBe('1,234.6');
    });
});
