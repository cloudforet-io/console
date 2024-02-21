import type { ResourceGroupType } from '@/schema/_common/type';

// variable models
export interface IBaseVariableModel {
    key: string;
    name: string;
    list(query?: ListQuery): Promise<ListResponse>;
    nameFormatter?: (data: any) => string;
    dependencies?: {
        [variableModelKey: string]: string;
    }
    prefetch?: boolean; // whether to prefetch data on site init
    //
    scope?: {
        resourceGroup?: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
        value?: string;
    };
    fixedOptions: Record<string, any>;
}
export interface IEnumVariableModel extends IBaseVariableModel {
    values: Value[];
}
// resourceType: string;
// resourceKey?: string;
// idKey: string;
// nameKey: string;
// only: string[];
// searchTargets: string[];
// nameFormatter: (data: any) => string;
export interface IResourceVariableModel extends IBaseVariableModel {
    resourceType: string;
    idKey: string;
    nameKey: string;
    only: string[];
    searchTargets: string[];
    nameFormatter: (data: any) => string;
    //
    keys?(): string[];
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
export interface ResourceVariableModelConfig {
    type: 'RESOURCE';
    name?: string;
    resource_type: string;
    reference_key?: string;
    id_key?: string;
}

// related types
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

