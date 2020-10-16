import { get, forEach, groupBy } from 'lodash';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';
import {
    KeyDataType,
    KeyItem, OperatorType, QueryItem, ValueItem,
} from '@/components/organisms/search/query-search/type';
import { Filter, FilterOperator } from '@/lib/space-connector/type';

import { getTimezone } from '@/lib/util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import {QueryFilters} from "@/lib/type";

dayjs.extend(utc);
dayjs.extend(tz);


type OperatorMap = Record<OperatorType, FilterOperator>
type DataTypeOperators = Record<KeyDataType, OperatorMap>;

const defaultOperatorMap: OperatorMap = {
    '': 'contain_in',
    '!': 'not_contain_in',
    '=': 'in',
    '!=': 'not_in',

    // single only
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    $: 'regex',
};

const singleOnlyOperators: OperatorType[] = ['>', '>=', '<', '<=', '$'];

const dataTypeOperators: DataTypeOperators = {
    string: defaultOperatorMap,
    integer: defaultOperatorMap,
    float: defaultOperatorMap,
    boolean: defaultOperatorMap,
    datetime: {
        ...defaultOperatorMap,
        '>': 'datetime_gt',
        '>=': 'datetime_gte',
        '<': 'datetime_lt',
        '<=': 'datetime_lte',
    },
};

type SingleValueFiltersMap = Record<string, Filter[]>
type MultiValueFiltersMap = Record<string, Filter>
interface QueryParam extends QueryTag {
    key: KeyItem;
}

const setSingleValueFiltersMap = (query: QueryParam, filtersMap: SingleValueFiltersMap) => {
    const filterKey = `${query.key.name}/${query.operator}`;
    const newFilter = {
        k: query.key.name,
        v: query.value.name,
        o: dataTypeOperators[query.key?.dataType || 'string'][query.operator],
    };

    if (filtersMap[filterKey]) filtersMap[filterKey].push(newFilter);
    else filtersMap[filterKey] = [newFilter];
};

const setMultiValueFiltersMap = (query: QueryParam, filtersMap: MultiValueFiltersMap) => {
    const filterKey = `${query.key.name}/${query.operator}`;
    if (filtersMap[filterKey]) {
        filtersMap[filterKey].v.push(query.value.name);
    } else {
        filtersMap[filterKey] = {
            k: query.key.name,
            v: [query.value.name],
            o: dataTypeOperators[query.key?.dataType || 'string'][query.operator],
        };
    }
};

interface FilterSetter {
    (query: QueryParam, singleFiltersMap: SingleValueFiltersMap, multiFiltersMap: MultiValueFiltersMap): void;
}


const defaultFilterSetter = (query: QueryParam, singleFiltersMap: SingleValueFiltersMap, multiFiltersMap: MultiValueFiltersMap) => {
    if (singleOnlyOperators.includes(query.operator)) {
        setSingleValueFiltersMap(query as QueryParam, singleFiltersMap);
    } else {
        setMultiValueFiltersMap(query as QueryParam, multiFiltersMap);
    }
};

const dateRegex = RegExp(/^(\d{4}-\d{2}-\d{2})$/);
const datetimeRegex = RegExp(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);
const filterSettersByDataType: Record<KeyDataType, FilterSetter> = {
    string: defaultFilterSetter,
    integer: defaultFilterSetter,
    float: defaultFilterSetter,
    boolean: defaultFilterSetter,
    datetime: (query: QueryParam, singleFiltersMap: SingleValueFiltersMap, multiFiltersMap: MultiValueFiltersMap) => {
        // datetime format case
        if (datetimeRegex.test(query.value.name as string)) {
            if (singleOnlyOperators.includes(query.operator)) setSingleValueFiltersMap(query, singleFiltersMap);
            else setMultiValueFiltersMap(query, multiFiltersMap);

        // date format case
        } else if (dateRegex.test(query.value.name as string)) {
            const time = dayjs.tz(query.value.name as string, getTimezone()).utc();
            if (['>', '<'].includes(query.operator)) {
                setSingleValueFiltersMap({
                    ...query,
                    value: { ...query.value, name: time.toISOString() },
                    operator: `${query.operator}=`,
                }, singleFiltersMap);
            } else if (query.operator === '=') {
                const gteQuery: QueryParam = {
                    ...query, value: { ...query.value, name: time.toISOString() }, operator: '>=',
                };
                const ltQuery: QueryParam = {
                    ...query, value: { ...query.value, name: time.add(1, 'day').toISOString() }, operator: '<',
                };
                setSingleValueFiltersMap(gteQuery, singleFiltersMap);
                setSingleValueFiltersMap(ltQuery, singleFiltersMap);
            }
        }
    },
};


/**
 * @name getFiltersFromQueryTags
 * @description convert query tags to api filters and keywords.
 * @param tags: QueryTag[]
 */
/**
 * // TODO: 문 서 화 ㅠ ㅠ
 * What? Operator 를 FilterOperator로 변환
 *    - 복수 value 가 가능한 operator 인지 확인 후, filter 포맷 정함
 *       - single value filters: {k, v, o}[]
 *       - multi value filters: {k, v[], o}[]
 *    - dataType 에 맞는 FilterOperator 선택
 *    - dataType 에 따라 필요한 경우, operator 와 value 변
 */
const getFiltersFromQueryTags = (tags: QueryTag[]): {andFilters: Filter[]; orFilters: Filter[]; keywords: string[]} => {
    const keywords: string[] = [];
    const singleValueFiltersMap: SingleValueFiltersMap = {};
    const multiValueFiltersMap: MultiValueFiltersMap = {};

    tags.forEach((q) => {
        if (!q.invalid) {
            if (q.key !== null && q.key !== undefined) {
                filterSettersByDataType[q.key.dataType || 'string'](
                    q as QueryParam,
                    singleValueFiltersMap,
                    multiValueFiltersMap,
                );
            } else if (q.value.name) keywords.push(String(q.value.name));
        }
    });

    return {
        andFilters: [
            ...Object.values(singleValueFiltersMap).flat(),
            ...Object.values(multiValueFiltersMap),
        ],
        orFilters: [],
        keywords,
    };
};


const tagRegex = new RegExp('^(?<key>.+?)?:(?<operator>[=|<|>|!|$]=?)?(?<value>.*)?');

/**
 * @name parseTag
 * @description Extract query item from url query string with regular expression
 * @param text
 */
const parseTag = (text: string): QueryItem => {
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

const queryFiltersToQueryTags = (queryFilters: QueryFilters, keyItems: KeyItem[] = []): QueryTag[] => {
    const res: QueryTag[] = [];

    const keyMap = {};
    forEach(keyItems, (d) => {
        keyMap[d.name] = d;
    });

    forEach(queryFilters, (values, k) => {
        if (k === 'keyword') {
            values.forEach((d) => {
                res.push({ value: { label: d as string, name: d }, operator: '' });
            });
        } else {
            const filterKey = k.split('/');
            const key = filterKey[0];
            values.forEach((d) => {
                res.push({
                    key: keyMap[key] || { label: key, name: key },
                    value: { label: d as string, name: d },
                    operator: filterKey[1],
                });
            });
        }
    });
    return res;
};

const queryTagsToQueryFilters = (queryTags: QueryTag[]): QueryFilters => {
    const res: QueryFilters = {
        keywords: [],
    };
    queryTags.forEach((tag) => {
        if (tag.key) {
            const filterKey = `${tag.key.name}/${tag.operator}`;
            if (!res[filterKey]) res[filterKey] = [];
            res[filterKey].push(tag.value.name);
        } else {
            res.keywords.push(tag.value.name);
        }
    });
    return res;
};

export {
    getFiltersFromQueryTags,
    parseTag,
    queryFiltersToQueryTags,
    queryTagsToQueryFilters,
};
