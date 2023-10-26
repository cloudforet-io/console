// variable models
export interface IBaseVariableModel {
    key: string;
    name: string;
    labels: VariableModelLabel[];
    list(options?: ListQuery): Promise<ListResponse>;
}
export interface IEnumVariableModel extends IBaseVariableModel {
    values: Value[];
}
export interface IResourceNameVariableModel extends IBaseVariableModel {
    resourceType: string;
    idKey: string;
    nameKey: string;
    only: string[];
    searchTargets: string[];
    formatter: (data: any) => string;
}
export interface IResourceValueVariableModel extends IBaseVariableModel {
    resourceType: string;
    referenceKey: string;
}

// variable model configs
export interface EnumVariableModelConfig {
    type: 'ENUM';
    name?: string;
    values: Value[];
}
export interface ResourceValueVariableModelConfig {
    type: 'RESOURCE_VALUE',
    name?: string;
    resource_type: string;
    reference_key: string;
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

