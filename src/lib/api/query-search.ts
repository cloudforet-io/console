import { StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';
import { FILTER_OPERATOR, FilterItem } from '@/lib/fluent-api/type';
import { fluentApi } from '@/lib/fluent-api';
import { get } from 'lodash';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import {
    KeyItem, QueryItem, ValueItem,
} from '@/components/organisms/search/query-search/type';
import { KeyHandler, ValueHandler, ValueHandlerMap } from '@/lib/component-utils/query-search/type';


export interface ACHandlerMeta {
    keyHandler: KeyHandler;
    valueHandlerMap: ValueHandlerMap;
    suggestKeys: string[];
}

export const defaultACHandler: ACHandlerMeta = {
    keyHandler: async inputText => ({
        results: [],
        totalCount: 0,
    }),
    valueHandlerMap: {},
    suggestKeys: [],
};

type getValueHandlerActionType<T> = (
    api: T,
    val: string,
    keyItem: KeyItem,
    itemLimit?: number,
    sortBy?: string,
    sortDesc?: boolean,
) => T


export const getStatAction: getValueHandlerActionType<StatQueryAPI<any, any>> = (
    action: StatQueryAPI<any, any>,
    val: string,
    keyItem: KeyItem,
    itemLimit = 10,
    sortBy?: string,
    sortDesc?: boolean,
): StatQueryAPI<any, any> => {
    let api = action.setDistinct(keyItem.name as string)
        .setSort(sortBy || keyItem.name, sortDesc === undefined ? false : sortDesc);
    api = api.setLimit(itemLimit);
    if (val) {
        api = api.setFilter({
            key: keyItem.name,
            operator: FILTER_OPERATOR.contain,
            value: val,
        });
    }
    return api;
};


export function getStatApiValueHandler(
    resourceType: string,
    getAction: getValueHandlerActionType<StatQueryAPI<any, any>> = getStatAction,
    formatter: (res: any) => {
        results: ValueItem[];
        totalCount: number;
    } = res => ({
        results: res.data.results.map(d => ({ label: d, name: d })),
        totalCount: res.data.total_count,
    }),
): ValueHandler {
    return async (val: string, keyItem: KeyItem) => {
        const res = await getAction(
            fluentApi.statisticsTest().resource().stat().setResourceType(resourceType),
            val, keyItem,
        ).execute();
        return formatter(res);
    };
}


export function getStatApiValueHandlerMap(
    keys: string[],
    resourceType: string,
    getAction: getValueHandlerActionType<StatQueryAPI<any, any>> = getStatAction,
    formatter: (res: any) => {
        results: ValueItem[];
        totalCount: number;
    } = res => ({
        results: res.data.results.map(d => ({ label: d, name: d })),
        totalCount: res.data.total_count,
    }),
): ValueHandlerMap {
    const map = {};
    keys.forEach((key) => {
        map[key] = getStatApiValueHandler(resourceType, getAction, formatter);
    });
    return map;
}

export const setFilterOrWithSuggestKeys = (query: FilterItem, suggestKeys: string[], filterOr: FilterItem[]): void => {
    suggestKeys.forEach((key) => {
        filterOr.push({ ...query, key });
    });
};

export const getQueryItemsToFilterItems = (tags: QueryItem[], suggestKeys?: string[]): {and: FilterItem[]; or: FilterItem[]} => {
    const and: FilterItem[] = [];
    const or: FilterItem[] = [];
    tags.forEach((q) => {
        if (q.key !== null && q.key !== undefined) {
            and.push({
                key: q.key?.name as string,
                value: q.value?.label || q.value?.name || '',
                operator: '',
            });
        } else if (suggestKeys) {
            setFilterOrWithSuggestKeys({
                key: '',
                value: q.value?.label || q.value?.name || '',
                operator: q.operator,
            }, suggestKeys, or);
        }
    });

    return { and, or };
};


const tagRegex = new RegExp('^(?<key>.+?)?:(?<operator>[=|<|>|!|$]=?)?(?<value>.*)?');

export const parseTag = (text: string): QueryTag => {
    const parsed = tagRegex.exec(text);

    const key: string|undefined = get(parsed, 'groups.key', undefined);
    const keyItem: KeyItem|undefined = key ? { label: key, name: key } : undefined;

    const operator = get(parsed, 'groups.operator', '').trim();

    const value = parsed ? get(parsed, 'groups.value', '').trim() : text.trim();
    const valueItem: ValueItem = { label: value, name: value };

    return {
        key: keyItem,
        operator,
        value: valueItem,
    };
};
