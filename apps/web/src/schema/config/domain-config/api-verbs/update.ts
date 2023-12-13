export interface UpdateDomainConfigParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Record<string, any>;
}
