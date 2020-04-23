/* eslint-disable camelcase */
import { BaseQueryState, TimeStamp } from '@/lib/fluent-api/type';

/* Stat Query */
export enum STAT_OPERATORS {
    count = 'count',
    sum = 'sum',
    average = 'avg',
    min = 'min',
    max = 'max',
    size = 'size',
    set = 'add_to_set',
    merge = 'merge_objects'
}

export interface GroupKeyItem {
    key: string;
    name: string;
}

export interface OneOrMoreArray<T> extends Array<T> {
    0: T;
}

export type GroupKeys = OneOrMoreArray<GroupKeyItem>;

export interface GroupFieldsItem {
    key?: string;
    name: string;
    operator: STAT_OPERATORS;
}

export interface Group {
    keys: GroupKeys;
    fields?: GroupFieldsItem[];
}

export interface UnwindItem {
    [key: string]: string;
}

export interface Aggregate {
    group: Group;
    unwind?: UnwindItem[];
}

export interface StatSort {
    name: string;
    desc: boolean;
}

export interface StatQueryState<param> extends BaseQueryState<param> {
    aggregate: Aggregate;
    sort: StatSort;
    limit: number;
}

/* Resource */
export interface JoinItem<param> extends StatQueryState<param> {
    key: string;
    resource_type: string;
    data_source_id?: string;
    query: StatQueryState<param>;
}

export interface FormulaItem {
    name: string;
    formula: string;
}

export interface ResourceStatParam<joinParam> {
    resource_type: string;
    join: JoinItem<joinParam>[];
    formulas: FormulaItem[];
    data_source_id?: string;
}

export interface StatResponse<value> {
    results: value[];
}

/* History */
export interface HistoryListParam {
    topic?: string;
}

export interface HistoryListResp {
    topic: string;
    values: object;
    created_at: TimeStamp;
}
