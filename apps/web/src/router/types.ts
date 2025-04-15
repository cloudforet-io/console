export interface RouteVersionInfo {
    name: string;
    params?: Record<string, any>;
}

export interface VersionedRouteConfig {
    V1: RouteVersionInfo;
    V2: RouteVersionInfo;
}

export type RouteMetadata = Record<string, VersionedRouteConfig>;

export interface ServiceNavigationOptions {
    version?: string;
    replace?: boolean;
    guards?: boolean;
}

export interface ServiceRouteParam {
    versions: Record<string, string>;
    required?: boolean;
    transform?: (value: any) => any;
    validate?: (value: any) => boolean;
}

export interface ServiceRouteError extends Error {
    code: string;
    params?: Record<string, any>;
}

export class ServiceNavigationError extends Error implements ServiceRouteError {
    code: string;

    params?: Record<string, any>;

    constructor(code: string, message: string, params?: Record<string, any>) {
        super(message);
        this.code = code;
        this.params = params;
        this.name = 'ServiceNavigationError';
    }
}
