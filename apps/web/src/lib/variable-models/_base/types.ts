// base variable model
export interface IBaseVariableModel {
    key: string;
    name: string;
    labels: VariableModelLabel[];
    list(options?: ListQuery): Promise<ListResponse>;
}

// enum variable model
export interface IEnumVariableModel extends IBaseVariableModel {
    values: Value[];
}

// resource field variable model
export interface IResourceNameVariableModel extends IBaseVariableModel {
    resourceType: string;
    idKey: string;
    nameKey: string;
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
export interface ListQuery {
    search?: string;
    start?: number;
    limit?: number;
    filters?: string[]; // to filter selected items
    options?: Record<string, any>; // for custom options by config
}
export interface ListResponse {
    results: Value[];
    more?: boolean;
}
export interface Value {
    key: string;
    name: string;
}

