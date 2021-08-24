import dayjs from 'dayjs';
import { rawQueryOperatorToApiQueryOperatorMap } from '@src/query/config';
import { Filter } from '@src/space-connector/type';
import { QueryStoreFilter } from '@src/query/type';

export const setDatetimeToFilters = (filters: Filter[], filter: QueryStoreFilter, timezone = 'UTC') => {
    const f = filter as Required<QueryStoreFilter>;
    if (typeof f.v === 'string') {
        const time = dayjs.utc(dayjs.tz(f.v, timezone));

        if (f.o === '>t' || f.o === '>=t') {
            filters.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] });
        } else if (f.o === '<t' || f.o === '<=t') {
            filters.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<=t'] });
        } else {
            filters.push({ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] });
            filters.push({ k: f.k, v: time.add(1, 'day').toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<t'] });
        }
    } else if (Array.isArray(f.v)) {
        f.v.forEach((v) => {
            setDatetimeToFilters(filters, { k: f.k, v, o: f.o }, timezone);
        });
    }
};

export const getDatetimeToFilters = (filter: QueryStoreFilter, timezone = 'UTC'): Filter[]|undefined => {
    const f = filter as Required<QueryStoreFilter>;
    if (typeof f.v === 'string') {
        const time = dayjs.utc(dayjs.tz(f.v, timezone));

        if (f.o === '>t' || f.o === '>=t') {
            return [{ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] }];
        } if (f.o === '<t' || f.o === '<=t') {
            return [{ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<=t'] }];
        }
        return [
            { k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] },
            { k: f.k, v: time.add(1, 'day').toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<t'] }
        ];
    }

    if (Array.isArray(f.v)) {
        const newFilters: Filter[] = [];
        f.v.forEach((v) => {
            const filtersByValue: Filter[]|undefined = getDatetimeToFilters({ k: f.k, v, o: f.o }, timezone);
            if (filtersByValue) {
                newFilters.concat(filtersByValue);
            }
        });
        return newFilters.length === 0 ? undefined : newFilters;
    }

    return undefined;
};
