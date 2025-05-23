export interface ReferenceQueryParams {
    search?: string;
    start?: number;
    limit?: number;
    filters?: string[]; // to filter selected items
    options?: Record<string, any>; // for custom options by config
}

export interface ReferenceQueryResponse<T = any> {
    results: Value<T>[];
    more?: boolean;
    title?: string;
}

export interface Value<T=any> {
    key: string;
    name: string;
    data?: T;
}
