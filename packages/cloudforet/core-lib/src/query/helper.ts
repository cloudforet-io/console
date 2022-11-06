import dayjs from 'dayjs';

import { rawQueryOperatorToApiQueryOperatorMap } from '@/query/config';
import type { QueryStoreFilter } from '@/query/type';
import type { Filter } from '@/space-connector/type';

const slashRegExp = /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
const dotRegExp = /^\d{4}\/(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])$/;
const hyphenRegExp = /^\d{4}\.(0?[1-9]|1[012])\.(0?[1-9]|[12][0-9]|3[01])$/;

const dateUnionRegExp = new RegExp(`${slashRegExp.source}|${dotRegExp.source}|${hyphenRegExp.source}`);

export const convertDatetimeQueryStoreFilterToFilters = (filter: QueryStoreFilter, timezone = 'UTC'): Filter[]|undefined => {
    const f = filter as Required<QueryStoreFilter>;
    if (typeof f.v === 'string') {
        const time = dayjs.tz(f.v, timezone);
        if (!dateUnionRegExp.test(f.v)) {
            return [{ k: f.k, v: time.toISOString(), o: rawQueryOperatorToApiQueryOperatorMap[f.o] }];
        }

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
