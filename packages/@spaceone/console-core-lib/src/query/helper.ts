import dayjs from 'dayjs';

import { rawQueryOperatorToApiQueryOperatorMap } from '@/query/config';
import type { QueryStoreFilter } from '@/query/type';
import type { Filter } from '@/space-connector/type';

export const convertDatetimeQueryStoreFilterToFilters = (filter: QueryStoreFilter, timezone = 'UTC'): Filter[]|undefined => {
    const f = filter as Required<QueryStoreFilter>;
    if (typeof f.v === 'string') {
        const time = dayjs.tz(f.v, timezone);

        if (f.o === '>t' || f.o === '>=t') {
            return [{ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] }];
        } if (f.o === '<t' || f.o === '<=t') {
            return [{ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<=t'] }];
        }
        return [
            { k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['>=t'] },
            { k: f.k, v: time.add(1, 'day').toISOString(), o: rawQueryOperatorToApiQueryOperatorMap['<t'] },
        ];
    }

    if (Array.isArray(f.v)) {
        let newFilters: Filter[] = [];
        f.v.forEach((v) => {
            const filtersByValue: Filter[]|undefined = convertDatetimeQueryStoreFilterToFilters({ k: f.k, v, o: f.o }, timezone);
            if (filtersByValue) {
                newFilters = newFilters.concat(filtersByValue);
            }
        });
        return newFilters.length === 0 ? undefined : newFilters;
    }

    return undefined;
};
