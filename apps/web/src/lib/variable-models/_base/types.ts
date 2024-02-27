// variable models
export interface IBaseVariableModel {
    _meta?: Record<string, any>;
    _dependencies?: {
        [variableModelKey: string]: string;
    }
    list(query?: ListQuery): Promise<ListResponse>;
    nameFormatter?(data: any): string;
    generateProperty?(options: any): PropertyObject<any>;
    //
    // scope?: {
    //     resourceGroup?: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    //     value?: string;
    // };
}
export interface IEnumVariableModel extends IBaseVariableModel {
    _meta: {
       key: string;
       name: string;
   };
   values: Value[];
}

interface ResourceVariableMeta {
    key: string;
    name: string;
    resourceType: string;
    idKey: string;
    nameKey: string;
    _only?: string[]; // protected
    _searchTargets?: string[]; // protected
}

export interface IResourceVariableModel<T = any> extends IBaseVariableModel {
    _meta: ResourceVariableMeta;
    [propertyKey: string]: PropertyObject<T> | any;
    nameFormatter(data: any): string;
    generateProperty(options: PropertyOptions<T>): PropertyObject<T>;
}

export type VariableModel = IBaseVariableModel | IEnumVariableModel | IResourceVariableModel;


// property
export interface PropertyOptions<T> {
    key: keyof T;
    name?: string;
    isDataKey?: boolean;
    isFilter?: boolean;
}
export interface PropertyObject<T> {
    key: keyof T;
    name?: string;
    isDataKey?: boolean;
    isFilter?: boolean;
    fixedValue?: any;
    values?(query?: ListQuery): Promise<ListResponse>;
}

// variable model constructor configs
export interface VariableModelConstructorConfig {
    key?: string;
    name?: string;
    // resource model only
    resource_type?: string;
    id_key?: string;
    // enum model only
    values?: Value[];
}
export interface ResourceVariableModelConstructorOptions {
    fixedOptions?: Record<string, any>;
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

