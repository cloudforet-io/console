import type { OperatorType } from '@/component-util/query-search/type';

export type ConsoleFilterOperator = OperatorType | '<t' | '<=t' | '>t' | '>=t' | '=t';

export type RawQuery = [any] | [any|null, string] | [any|null, string, ConsoleFilterOperator];

export type ConsoleFilterValue = number | string | boolean | null;

export type ConsoleFilter = {
    k?: string;
    v: ConsoleFilterValue | ConsoleFilterValue[];
    o?: ConsoleFilterOperator;
};
