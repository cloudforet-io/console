import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

// base variable model
export interface IBaseVariableModel {
    key: string;
    name: string;
    labels: VariableModelLabel[];
    list(options?: ListOptions): Promise<ListResponse>;
    dataSetKeys?: string[]; // for multiple list case
}

// enum variable model
export interface IEnumVariableModel extends IBaseVariableModel {
    values: Value[];
}

// resource field variable model
export interface IResourceFieldVariableModel extends IBaseVariableModel {
    resourceType: string;
    resourceId: string;
    only: string[];
    searchTargets: string[];
    formatter: (data: any) => string;
}

// resource value variable model
export interface IResourceValueVariableModel extends IBaseVariableModel {
    resourceType: string;
    referenceKey: string;
}

// related types
export type VariableModelLabel = 'cost'|'asset';
export interface ListOptions {
    search?: string;
    limit?: number;
    values?: Value[];
    filter?: ApiFilter[];
    only?: string[];
    dataSetKey?: string; // for compound variable model
}
export interface ListResponse {
    results: Value[];
    more?: boolean;
}
export interface Value {
    key: string;
    name: string;
}

