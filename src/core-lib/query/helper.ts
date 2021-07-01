import dayjs from 'dayjs';
import { rawQueryOperatorToApiQueryOperatorMap } from '@/core-lib/query/config';
import { Filter } from '@/core-lib/space-connector/type';
import { QueryStoreFilter } from '@/core-lib/query/type';

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
