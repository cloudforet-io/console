import {
    find, flatMap, forEach,
} from 'lodash';
import { Location } from 'vue-router';
import router from '@/routes';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { parseTag } from '@/lib/component-utils/query-search-tags';
import {
    KeyItemSet, QueryItem,
} from '@/components/organisms/search/query-search/type';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

export type RouteQueryString = string | (string | null)[] | null | undefined;

/** QueryStringRef Helpers */
export const replaceQuery = async (key: string, value: RouteQueryString) => {
    try {
        await router.replace({ query: { ...router.currentRoute.query, [key]: value } });
    } catch (e) {

    }
};


/** QueryString Converter Helpers */
const getQueryItemFromQueryString = (queryString: string, keyItemSets?: KeyItemSet[]): QueryItem => {
    const parsedItem: QueryItem = parseTag(queryString);
    if (parsedItem.key?.name) {
        if (keyItemSets) {
            const originKeyItem = find(flatMap(keyItemSets, d => d.items), { name: parsedItem.key.name });
            if (originKeyItem) parsedItem.key = { ...originKeyItem };
        }
    }
    // if (queryItem.key?.dataType === 'datetime') {
    //     const time = dayjs.utc(queryItem.value.name);
    //     if (time.isValid()) {
    //         queryItem.value = {
    //             label: dayjs.tz(time, store.state.user.timezone || 'UTC').format('YYYY-MM-DD'),
    //             name: time.format('YYYY-MM-DD'),
    //         };
    //     }
    // }
    return parsedItem;
};

export const queryStringToQueryTags = (queryString: RouteQueryString, keyItemSets?: KeyItemSet[]): QueryTag[] => {
    if (!queryString) return [];
    if (Array.isArray(queryString)) {
        return queryString.reduce((res, qs) => {
            if (qs) res.push(getQueryItemFromQueryString(qs, keyItemSets));
            return res;
        }, [] as QueryTag[]);
    }
    return [getQueryItemFromQueryString(queryString as string, keyItemSets)];
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
