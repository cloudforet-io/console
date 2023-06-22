import { QueryHelper } from '@/query';

describe('Query Helper', () => {
    test('init QueryHelper', () => {
        const queryHelper = new QueryHelper();
        expect(queryHelper.apiQuery).toEqual({
            filter: [],
            filterOr: [],
            keyword: '',
        });
    });

    describe('convert console filter with datetime operator', () => {
        test('date value and "=t" operator => "datetime_gte", "datetime_lt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01',
                o: '=t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T00:00:00.000Z', o: 'datetime_gte' },
                { k: 'time', v: '2021-05-02T00:00:00.000Z', o: 'datetime_lt' },
            ]);
        });
        test('date value and ">t" operator => "datetime_gte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01',
                o: '>t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T00:00:00.000Z', o: 'datetime_gte' },
            ]);
        });
        test('date value and ">=t" operator => "datetime_gte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01',
                o: '>=t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T00:00:00.000Z', o: 'datetime_gte' },
            ]);
        });
        test('date value and "<t" operator => "datetime_lte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01',
                o: '<t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T00:00:00.000Z', o: 'datetime_lte' },
            ]);
        });
        test('date value and "<=t" operator => "datetime_lte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01',
                o: '<=t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T00:00:00.000Z', o: 'datetime_lte' },
            ]);
        });
        test('datetime value and "=t", ">t" operator => "datetime_gt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01 12:00:00',
                o: '=t',
            }, {
                k: 'time',
                v: '2021-05-01 12:00:00',
                o: '>t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T12:00:00.000Z', o: 'datetime_gt' },
                { k: 'time', v: '2021-05-01T12:00:00.000Z', o: 'datetime_gt' },
            ]);
        });
        test('datetime value and "<t" operator => "datetime_lt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01 12:00:00',
                o: '<t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T12:00:00.000Z', o: 'datetime_lt' },
            ]);
        });
        test('datetime value and ">=t" operator => "datetime_gte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01 12:00:00',
                o: '>=t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T12:00:00.000Z', o: 'datetime_gte' },
            ]);
        });
        test('datetime value and "<=t" operator => "datetime_lte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: '2021-05-01 12:00:00',
                o: '<=t',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'time', v: '2021-05-01T12:00:00.000Z', o: 'datetime_lte' },
            ]);
        });
    });

    describe('convert console filter with timediff operator', () => {
        test('">td" operator => "timediff_gt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: 'now - 1d',
                o: '>td',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'time', v: 'now - 1d', o: 'timediff_gt' }]);
        });
        test('">=td" operator => "timediff_gte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: 'now - 1d',
                o: '>=td',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'time', v: 'now - 1d', o: 'timediff_gte' }]);
        });
        test('"<td" operator => "timediff_lt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: 'now - 1d',
                o: '<td',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'time', v: 'now - 1d', o: 'timediff_lt' }]);
        });
        test('"<=td" operator => "timediff_lte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'time',
                v: 'now - 1d',
                o: '<=td',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'time', v: 'now - 1d', o: 'timediff_lte' }]);
        });
    });

    describe('convert console filter with singular values to api filters', () => {
        test('"" operator => "contain"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: 'test',
                o: '',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: 'test', o: 'contain' }]);
        });
        test('"!" operator => "not_contain"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: 'test',
                o: '!',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: 'test', o: 'not_contain' }]);
        });
        test('"=" operator => "eq"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: 'test',
                o: '=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: 'test', o: 'eq' }]);
        });
        test('"!=" operator => "not"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: 'test',
                o: '!=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: 'test', o: 'not' }]);
        });
        test('"~" operator => "regex"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: 'test',
                o: '~',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: 'test', o: 'regex' }]);
        });
        test('">" operator => "gt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'age',
                v: '18',
                o: '>',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'age', v: '18', o: 'gt' }]);
        });
        test('">=" operator => "gte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'age',
                v: '18',
                o: '>=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'age', v: '18', o: 'gte' }]);
        });
        test('"<" operator => "lt"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'age',
                v: '18',
                o: '<',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'age', v: '18', o: 'lt' }]);
        });
        test('"<=" operator => "lte"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'age',
                v: '18',
                o: '<=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'age', v: '18', o: 'lte' }]);
        });
    });

    describe('convert console filter with plural values to api filters', () => {
        test('"" operator => "contain_in"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: ['test1', 'test2'], o: 'contain_in' }]);
        });
        test('"!" operator => "not_contain_in"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '!',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: ['test1', 'test2'], o: 'not_contain_in' }]);
        });
        test('"=" operator => "in"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: ['test1', 'test2'], o: 'in' }]);
        });
        test('"!=" operator => "not_in"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '!=',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: ['test1', 'test2'], o: 'not_in' }]);
        });
        test('"~" operator => "regex_in"', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '~',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([{ k: 'name', v: ['test1', 'test2'], o: 'regex_in' }]);
        });
        test('in case of not supported operator for plural values, values are converted to single value', () => {
            const queryHelper = new QueryHelper();
            const apiFilters = queryHelper.setFilters([{
                k: 'name',
                v: ['test1', 'test2'],
                o: '>',
            }]).apiQuery.filter;
            expect(apiFilters).toEqual([
                { k: 'name', v: 'test1', o: 'gt' },
                { k: 'name', v: 'test2', o: 'gt' },
            ]);
        });
    });
});
