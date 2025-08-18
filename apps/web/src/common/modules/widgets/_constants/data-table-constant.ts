import { cloneDeep } from 'lodash';

import type {
    AddLabelsOptions,
    ConcatOptions, EvalOptions, JoinOptions, PivotOptions, QueryOptions, ValueMappingOptions,
    AggregateOptions,
} from '@/common/modules/widgets/types/widget-model';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export const DATA_TABLE_TYPE = {
    ADDED: 'ADDED',
    TRANSFORMED: 'TRANSFORMED',
};

export const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    UNIFIED_COST: 'UNIFIED_COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};

export const DATA_TABLE_OPERATOR = {
    CONCAT: 'CONCAT',
    JOIN: 'JOIN',
    QUERY: 'QUERY',
    AGGREGATE: 'AGGREGATE',
    EVAL: 'EVAL',
    PIVOT: 'PIVOT',
    ADD_LABELS: 'ADD_LABELS',
    VALUE_MAPPING: 'VALUE_MAPPING',
} as const;

export const JOIN_TYPE = {
    LEFT: 'left',
    RIGHT: 'right',
    OUTER: 'outer',
    INNER: 'inner',
} as const;

// NOTE: temporary solution for the global variable
export const MANAGED_GLOBAL_VARIABLE = [GROUP_BY.WORKSPACE, GROUP_BY.PROJECT, GROUP_BY.SERVICE_ACCOUNT, GROUP_BY.REGION] as string[];

export const DATA_TABLE_FIELD_TYPE = {
    LABEL: 'LABEL',
    DATA: 'DATA',
} as const;

export const DATA_TABLE_QUERY_OPERATOR = {
    contain_in: {
        key: 'contain_in',
        operator: 'contain_in',
        label: 'contains',
    },
    not_contain_in: {
        key: 'not_contain_in',
        operator: 'not_contain_in',
        label: 'does not contain',
    },
    in: {
        key: 'in',
        operator: 'in',
        label: 'equals',
    },
    not_in: {
        key: 'not_in',
        operator: 'not_in',
        label: 'does not equal',
    },
    use_global_variable: {
        key: 'use_global_variable',
        operator: 'use_global_variable',
        label: 'use global variable',
    },
} as const;

export const KEYWORD_FILTER_DISABLED_KEYS = [GROUP_BY.PROJECT, GROUP_BY.WORKSPACE, GROUP_BY.SERVICE_ACCOUNT];

export const DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP = {
    PIVOT: {
        data_table_id: undefined,
        fields: {
            labels: [],
            data: undefined,
            column: undefined,
        },
        select: undefined,
        limit: 5,
        function: 'sum',
        order_by: {
            type: 'key',
            desc: false,
        },
    } as PivotOptions,
    CONCAT: {
        data_tables: [],
    } as ConcatOptions,
    JOIN: {
        data_tables: [],
        how: undefined,
        left_keys: [''],
        right_keys: [''],
    } as JoinOptions,
    EVAL: {
        data_table_id: undefined,
        expressions: [
            {
                name: '',
                field_type: DATA_TABLE_FIELD_TYPE.DATA,
                expression: '',
            },
        ],
    } as EvalOptions,
    QUERY: {
        data_table_id: undefined,
        conditions: [''],
        // operator: 'AND',
    } as QueryOptions,
    AGGREGATE: {
        data_table_id: undefined,
        group_by: [],
        function: {},
    } as AggregateOptions,
    ADD_LABELS: {
        data_table_id: undefined,
        labels: { '': '' },
    } as AddLabelsOptions,
    VALUE_MAPPING: {
        data_table_id: undefined,
        name: '',
        key: undefined,
        field_type: DATA_TABLE_FIELD_TYPE.LABEL,
        cases: [
            {
                value: '',
                operator: 'eq',
                match: '',
            },
        ],
    } as ValueMappingOptions,
};

export const TRANSFORM_DATA_TABLE_DEFAULT_OPTIONS = {
    JOIN: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.JOIN),
    CONCAT: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.CONCAT),
    QUERY: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.QUERY),
    EVAL: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.EVAL),
    AGGREGATE: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.AGGREGATE),
    PIVOT: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT),
    ADD_LABELS: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS),
    VALUE_MAPPING: cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING),
};

export const GROUP_BY_INFO_ITEMS_FOR_TAGS = [
    {
        key: GROUP_BY.SERVICE_ACCOUNT,
        name: 'service_account',
    },
] as const;
