import { Filter } from '@/lib/space-connector/type';
import { OperatorType } from '@/components/organisms/search/query-search/type';

export type RawQuery = [any] | [any|null, string] | [any|null, string, RawQueryOperator]

export type RawQueryOperator = OperatorType | '<t' | '<=t' | '>t' | '>=t' | '=t'


export type ApiQuery = {
    filter: Filter[];
    keyword: string;
}

export type QueryStoreFilter = {
    k?: string;
    v: any;
    o?: RawQueryOperator;
}
