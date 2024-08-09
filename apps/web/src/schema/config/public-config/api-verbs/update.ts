export interface PublicConfigUpdateParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Record<string, any>;
}
