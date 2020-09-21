import {
    forEach, get, set, debounce, find,
} from 'lodash';
import router from '@/routes';
import {
    computed, onUnmounted, watch, ref, Ref, UnwrapRef,
} from '@vue/composition-api';
import { Dictionary } from 'vue-router/types/router';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import { parseTag } from '@/lib/api/query-search';
import { KeyItem, QueryItem } from '@/components/organisms/search/query-search/type';
import { store } from '@/store';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

export type RouteQueryString = string | (string | null)[] | null | undefined;
export type RouteQuery = Dictionary<RouteQueryString>;

export type Setter = (val: RouteQueryString) => any
export type Getter = (val: any) => RouteQueryString
export type AutoReplacer = (queryRef: Ref<any>, key: string, ...args) => void;
export interface QueryStringConverter {
    key: string;
    getter?: Getter;
    setter?: Setter;
    disableSetter?: boolean;
    disableAutoReplace?: boolean;
    autoReplacer?: AutoReplacer;
}
export interface QueryStringConverterMap {
    [key: string]: QueryStringConverter;
}


/** QueryStringRef Helpers */
export const replaceQuery = async (key: string, value: RouteQueryString) => {
    try {
        await router.replace({ query: { ...router.currentRoute.query, [key]: value } });
    } catch (e) {

    }
};

export const getQueryStringComputed = (
    item: Ref<any>,
    converter: QueryStringConverter,
): Ref<any> => {
    if (converter.disableSetter) {
        return computed<RouteQueryString>(() => (converter.getter ? converter.getter(item.value) : item.value));
    }
    return computed<RouteQueryString>({
        get: () => (converter.getter ? converter.getter(item.value) : item.value),
        // eslint-disable-next-line no-empty-function
        set: (val) => {
            if (converter.setter) item.value = converter.setter(val);
            else item.value = val;
        },
    });
};

export const setQueryStringRefWatchable = (queryRef: Ref<any>, key: string) => {
    const stop = watch(() => queryRef.value, debounce((val: string) => {
        replaceQuery(key, val);
    }, 100), { immediate: false });

    onUnmounted(() => stop());
};


export const makeQueryStringComputed = (
    item: Ref<any>,
    converter: QueryStringConverter,
    initQuery?: RouteQuery,
): Ref<any> => {
    const queryRef = getQueryStringComputed(item, converter);

    if (!converter.disableAutoReplace) {
        if (converter.autoReplacer) converter.autoReplacer(queryRef, converter.key);
        else setQueryStringRefWatchable(queryRef, converter.key);
    }

    const query = initQuery || router.currentRoute.query;
    if (query[converter.key] && !converter.disableSetter) {
        queryRef.value = query[converter.key];
    }

    return queryRef;
};


export const getQueryStringComputeds: any = (
    state: UnwrapRef<any>,
    converterMap: QueryStringConverterMap,
) => {
    const res = {};
    forEach(converterMap, (converter, stateKey) => {
        if (converter.disableSetter) {
            res[converter.key] = computed<RouteQueryString>(() => {
                if (converter.getter) {
                    return converter.getter(get(state, stateKey));
                }
                return get(state, stateKey);
            });
        } else {
            res[converter.key] = computed<RouteQueryString>({
                get: () => {
                    if (converter.getter) {
                        return converter.getter(get(state, stateKey));
                    }
                    return get(state, stateKey);
                },
                set: (val) => {
                    if (converter.setter) set(state, stateKey, converter.setter(val));
                    else set(state, stateKey, val);
                },
            });
        }
    });
    return res;
};

export const makeQueryStringComputeds = (
    state: UnwrapRef<any>,
    converterMap: QueryStringConverterMap,
    initQuery?: RouteQuery,
) => {
    const queryRefs = getQueryStringComputeds(state, converterMap);

    forEach(converterMap, (converter) => {
        const query = initQuery || router.currentRoute.query;
        if (query[converter.key] && !converter.disableSetter) {
            queryRefs[converter.key].value = query[converter.key];
        }

        if (!converter.disableAutoReplace) {
            if (converter.autoReplacer) converter.autoReplacer(queryRefs[converter.key], converter.key);
            else setQueryStringRefWatchable(queryRefs[converter.key], converter.key);
        }
    });

    return queryRefs;
};


/** QueryString Converter Helpers */
export const queryStringToNumberArray: Setter = (val: RouteQueryString): number[] => {
    if (typeof val === 'string') return [Number(val)];
    if (Array.isArray(val)) return val.map(d => Number(d));
    return [];
};

export const queryTagsToQueryString = (tags: QueryTag[]): RouteQueryString => {
    if (Array.isArray(tags)) {
        return tags.reduce((results, tag) => {
            if (tag.invalid) return results;
            if (tag.key) results.push(`${tag.key.name}:${tag.operator}${tag.value?.name}`);
            else results.push(`${tag.value?.name}`);
            return results;
        }, [] as string[]);
    }
    return null;
};

const getQueryItemFromQueryString = (queryString: string, keyItems?: KeyItem[]): QueryItem => {
    const queryItem: QueryItem = parseTag(queryString);
    if (queryItem.key?.name && keyItems) {
        queryItem.key = find(keyItems, { name: queryItem.key.name }) || queryItem.key;
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
    return queryItem;
};

export const queryStringToQueryTags = (queryString: RouteQueryString, keyItems?: KeyItem[]): QueryTag[] => {
    if (!queryString) return [];
    if (Array.isArray(queryString)) {
        return queryString.reduce((res, qs) => {
            if (qs) res.push(getQueryItemFromQueryString(qs, keyItems));
            return res;
        }, [] as QueryTag[]);
    }
    return [getQueryItemFromQueryString(queryString as string, keyItems)];
};

/** QueryString replacer Helpers */
export const selectIndexAutoReplacer: AutoReplacer = (slRef: Ref<any>, key: string) => {
    let initValue = slRef.value;
    const stop = watch(() => slRef.value, debounce((val: string) => {
        if (initValue.length > 0) {
            slRef.value = initValue;
            initValue = [];
        } else {
            replaceQuery(key, val);
        }
    }, 100), { immediate: false });

    onUnmounted(() => stop());
};
