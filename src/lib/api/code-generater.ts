/* eslint-disable camelcase */
import { FilterItem } from '@/lib/fluent-api';
import { GroupFieldsItem, GroupKeyItem, JoinStateItem } from '../fluent-api/statistics/type';

const sample = {
    resource_type: 'inventory.CloudServiceType',
    query: {
        aggregate: {
            group: {
                keys: [
                    {
                        key: 'cloud_service_type_id',
                        name: 'cloud_service_type_id',
                    },
                    {
                        key: 'name',
                        name: 'cloud_service_type',
                    },
                    {
                        key: 'group',
                        name: 'cloud_service_group',
                    },
                    {
                        key: 'provider',
                        name: 'provider',
                    },
                ],
            },
        },
        sort: {
            name: 'cloud_service_count',
            desc: true,
        },
    },
    join: [
        {
            keys: [
                'cloud_service_type',
                'cloud_service_group',
                'provider',
            ],
            resource_type: 'inventory.CloudService',
            query: {
                aggregate: {
                    group: {
                        keys: [
                            {
                                key: 'cloud_service_type',
                                name: 'cloud_service_type',
                            },
                            {
                                key: 'cloud_service_group',
                                name: 'cloud_service_group',
                            },
                            {
                                key: 'provider',
                                name: 'provider',
                            },
                        ],
                        fields: [
                            {
                                operator: 'count',
                                name: 'cloud_service_count',
                            },
                        ],
                    },
                },
            },
        },
        {
            keys: [
                'cloud_service_type',
                'cloud_service_group',
                'provider',
            ],
            resource_type: 'inventory.CloudService',
            query: {
                filter: [
                    {
                        key: 'created_at',
                        value: 'now/d',
                        operator: 'timediff_gte',
                    },
                ],
                aggregate: {
                    group: {
                        keys: [
                            {
                                key: 'cloud_service_type',
                                name: 'cloud_service_type',
                            },
                            {
                                key: 'cloud_service_group',
                                name: 'cloud_service_group',
                            },
                            {
                                key: 'provider',
                                name: 'provider',
                            },
                        ],
                        fields: [
                            {
                                operator: 'count',
                                name: 'yesterday_cloud_service_count',
                            },
                        ],
                    },
                },
            },
        },
    ],
};

const joinSimpleMap = {
    keys: 'setJoinKeys',
    // eslint-disable-next-line camelcase
    resource_type: 'setJoinResourceType',
    type: 'setJoinType',
};
export const OPERATOR_MAP = Object.freeze({
    eq: '',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    timediff_lt: 'td_lt',
    timediff_gt: 'td_gt',
    timediff_gte:'td_gte',
    timediff_lte:'td_lte',
    regx: '$',
});

const makeMethod = (name: string, value?: any, rawValue?: string) => `.${name}(${value ? JSON.stringify(value) : rawValue})`;
const makeIndexMethod = (name: string, idx: number, value?: any, rawValue?: string) => `.${name}(${value ? JSON.stringify(value) : rawValue},${idx})`;
const addJoinGroupKeyParser = (fields: GroupKeyItem[], idx: number) => {
    const codes: string[] = fields.map(f => makeIndexMethod('addJoinGroupKey', idx, undefined, `${JSON.stringify(f.key)},${JSON.stringify(f.name)}`));
    return codes.join('\n');
};
const addJoinGroupFieldParser = (fields: GroupFieldsItem[], idx: number) => {
    const codes: string[] = fields.map((f) => {
        let raw;
        if (f.key) {
            raw = `${JSON.stringify(f.name)},${JSON.stringify(f.operator)},${JSON.stringify(f.key)}`;
        } else {
            raw = `${JSON.stringify(f.name)},${JSON.stringify(f.operator)}`;
        }
        return makeIndexMethod('addJoinGroupField', idx, undefined, raw);
    });
    return codes.join('\n');
};
const makeFilters = (filters: FilterItem[]) => filters.map((i) => {
    if (OPERATOR_MAP[i.operator]) {
        i.operator = OPERATOR_MAP[i.operator];
    }
    return JSON.stringify(i);
});

const setJoinFilterParser = (filters: FilterItem[], idx: number, method = 'setJoinFilter'): string => {
    const codes = makeFilters(filters);
    return makeIndexMethod(method, idx, undefined, `[${codes.join(',')}]`);
};

const joinParser = (joinQuery: any[]): string => {
    const codes = joinQuery.map((q: JoinStateItem, idx) => {
        const codeBlock: string[] = [];
        Object.entries(joinSimpleMap).forEach(([key, method]) => {
            if (q[key]) {
                codeBlock.push(makeIndexMethod(method, idx, q[key]));
            }
        });
        if (q.query?.aggregate?.group) {
            const keys = q.query?.aggregate?.group?.keys;
            if (keys) {
                codeBlock.push(addJoinGroupKeyParser(keys, idx));
            }
            const fields = q.query?.aggregate?.group?.fields;
            if (fields) {
                codeBlock.push(addJoinGroupFieldParser(fields, idx));
            }
        }
        const filter = q.query?.filter;
        if (filter) {
            codeBlock.push(setJoinFilterParser(filter, idx));
        }
        // @ts-ignore
        const filter_or = q.query?.filter_or;
        if (filter_or) {
            codeBlock.push(setJoinFilterParser(filter_or, idx, 'setJoinFilterOr'));
        }
        const sort = q.query?.sort;
        if (sort) {
            const name = `${JSON.stringify(sort.name)}`;
            codeBlock.push(makeIndexMethod('setJoinSort', idx, typeof sort.desc === 'boolean' ? `${name},${JSON.stringify(sort.desc)}` : name));
        }

        return `\n${codeBlock.join('\n')}`;
    });
    return codes.join('\n');
};
const addGroupKeyParser = (fields: GroupKeyItem[]) => {
    const codes: string[] = fields.map(f => makeMethod('addGroupKey', undefined, `${JSON.stringify(f.key)},${JSON.stringify(f.name)}`));
    return codes.join('\n');
};
const addGroupFieldParser = (fields: GroupFieldsItem[]) => {
    const codes: string[] = fields.map((f) => {
        let raw;
        if (f.key) {
            raw = `${JSON.stringify(f.name)},${JSON.stringify(f.operator)},${JSON.stringify(f.key)}`;
        } else {
            raw = `${JSON.stringify(f.name)},${JSON.stringify(f.operator)}}`;
        }
        return makeMethod('addGroupField', undefined, raw);
    });
    return codes.join('\n');
};
const setFilterParser = (filters: FilterItem[], method = 'setFilter'): string => {
    const codes = makeFilters(filters);
    return makeMethod(method, undefined, codes.join(','));
};
const queryParser = (query): string => {
    const codeBlock: string[] = [];
    const keys = query.aggregate?.group?.keys;
    if (keys) {
        codeBlock.push(addGroupKeyParser(keys));
    }
    const fields = query.aggregate?.group?.fields;
    if (fields) {
        codeBlock.push(addGroupFieldParser(fields));
    }
    const filter = query.filter;
    if (filter) {
        codeBlock.push(setFilterParser(filter));
    }
    const filter_or = query.filter_or;
    if (filter_or) {
        codeBlock.push(setFilterParser(filter_or, 'setFilterOr'));
    }
    const sort = query.sort;
    if (sort) {
        const name = `${JSON.stringify(sort.name)}`;
        codeBlock.push(makeMethod('setSort', undefined, typeof sort.desc === 'boolean' ? `${name},${JSON.stringify(sort.desc)}` : name));
    }

    return `\n${codeBlock.join('\n')}`;
};

const parserSimpleMap = {
    // eslint-disable-next-line camelcase
    resource_type: 'setResourceType',
    query: queryParser,
    join: joinParser,
};

export const parser = (raw: string): string => {
    const codeBlock = ['fluentApi.statisticsTest().resource().stat()'];
    const jsonCode = JSON.parse(raw);
    Object.entries(parserSimpleMap).forEach(([key, method]) => {
        if (jsonCode[key]) {
            if (typeof method === 'string') {
                codeBlock.push(makeMethod(method, jsonCode[key]));
            } else {
                codeBlock.push(method(jsonCode[key]));
            }
        }
    });
    return codeBlock.join('\n');
};
