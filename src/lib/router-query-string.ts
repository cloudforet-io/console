import { forEach } from 'lodash';
import { Location } from 'vue-router';
import router from '@/routes';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

export type RouteQueryString = string | (string | null)[] | null | undefined;


/** QueryString Converter Helpers */
export const replaceUrlQuery = async (key: string, value: RouteQueryString) => {
    try {
        await router.replace({ query: { ...router.currentRoute.query, [key]: value } });
    } catch (e) {

    }
};

export const queryTagsToQueryString = (tags: QueryTag[]): RouteQueryString => {
    if (Array.isArray(tags)) {
        return tags.reduce((results, tag) => {
            if (tag.invalid) return results;
            if (tag.key) {
                const key = tag.key.name;
                results.push(`${key}:${tag.operator}${tag.value?.name}`);
            } else results.push(`${tag.value?.name}`);
            return results;
        }, [] as string[]);
    }
    return null;
};

export const queryStringToStringArray = (queryString: RouteQueryString): string[] => {
    if (queryString === undefined || queryString === null) return [];
    if (typeof queryString === 'string') return [queryString];
    return queryString.reduce((res, d) => {
        if (d !== null) res.push(d);
        return res;
    }, [] as string[]);
};

export const locationQueryToString = (locationQuery: Location['query']): string => {
    if (!locationQuery) return '';
    const queryStrings: string[] = [];
    forEach(locationQuery, (v, k) => {
        if (k === 'filters') {
            let filters: string[] = locationQuery.filters as string[];
            filters = filters.map(d => `filters=${d}`);
            queryStrings.push(...filters);
        } else {
            queryStrings.push(`${k}=${v}`);
        }
    });
    return queryStrings.join('&');
};
