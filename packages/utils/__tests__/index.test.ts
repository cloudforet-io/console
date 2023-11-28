import { iso8601Formatter } from '@/index';

describe('iso8601Formatter', () => {
    const time = '2022-07-14T07:50:11.409Z';

    test('Convert to default format UTC iso 8601 string', () => {
        const result = iso8601Formatter(time, 'UTC');
        expect(result).toBe('2022-07-14 07:50:11');
        expect(result).not.toBe('2022-07-14 07:50:12');
    });
});
