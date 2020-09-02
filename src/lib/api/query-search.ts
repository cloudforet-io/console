import { FilterItem } from '@/lib/fluent-api/type';
import { OPERATOR_MAP } from '@/lib/fluent-api';
import { get } from 'lodash';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import {
    KeyItem, QueryItem, ValueHandlerMap, ValueItem,
} from '@/components/organisms/search/query-search/type';
import { Filter, FilterOperator } from '@/lib/space-connector/type';


export interface ACHandlerMeta {
    keyItems: KeyItem[];
    valueHandlerMap: ValueHandlerMap;
}

export const defaultACHandler: ACHandlerMeta = {
    keyItems: [],
    valueHandlerMap: {},
};

export const setFilterOrWithSuggestKeys = (query: FilterItem, keyItems: KeyItem[], filterOr: FilterItem[]): void => {
    keyItems.forEach((keyItem) => {
        filterOr.push({ ...query, key: keyItem.name });
    });
};

export const getQueryItemsToFilterItems = (tags: QueryTag[], keyItems?: KeyItem[]): {and: FilterItem[]; or: FilterItem[]} => {
    const and: FilterItem[] = [];
    const or: FilterItem[] = [];
    tags.forEach((q) => {
        if (q.key !== null && q.key !== undefined && !q.invalid) {
            and.push({
                key: q.key?.name as string,
                value: String(q.value?.name || ''),
                operator: q.operator,
            });
        } else if (keyItems) {
            setFilterOrWithSuggestKeys({
                key: '',
                value: String(q.value?.name || ''),
                operator: q.operator,
            }, keyItems, or);
        }
    });

    return { and, or };
};

export const getFiltersFromQueryTags = (tags: QueryTag[]): {and: Filter[]; or: string[]} => {
    const or: string[] = [];
    const andMap: Record<string, Filter> = {};
    tags.forEach((q) => {
        if (!q.invalid) {
            if (q.key !== null && q.key !== undefined) {
                const operator = OPERATOR_MAP[q.operator] as FilterOperator;
                const filter = andMap[`${q.key.name}/${operator}`];
                if (filter && filter.o === operator) {
                    filter.v.push(q.value?.name || '');
                } else {
                    andMap[`${q.key.name}/${operator}`] = {
                        k: q.key.name,
                        v: [q.value?.name || ''],
                        o: operator,
                    };
                }
            } else if (q.value.name) or.push(String(q.value.name));
        }
    });

    return { and: Object.values(andMap), or };
};


const tagRegex = new RegExp('^(?<key>.+?)?:(?<operator>[=|<|>|!|$]=?)?(?<value>.*)?');

export const parseTag = (text: string): QueryItem => {
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
