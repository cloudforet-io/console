import type { OperatorType } from '@/component-util/query-search/type';

export type RawQueryOperator = OperatorType | '<t' | '<=t' | '>t' | '>=t' | '=t';

export type RawQuery = [any] | [any|null, string] | [any|null, string, RawQueryOperator];

export type QueryStoreFilterValue = number | string | boolean | null;

export type QueryStoreFilter = {
    k?: string;
    v: QueryStoreFilterValue | QueryStoreFilterValue[];
    o?: RawQueryOperator;
};
