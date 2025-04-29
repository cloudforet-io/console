import type { RouteConfig } from 'vue-router';

import type { SERVICE_FEATURES } from '@/lib/config/global-config/constants/constants';
import type { Menu } from '@/lib/menu/config';

export type FeatureKeyType = typeof SERVICE_FEATURES[keyof typeof SERVICE_FEATURES];
export type FeatureVersion = 'V1' | 'V2';

export type ServiceConfig = {
    ENABLED: boolean;
    VERSION: FeatureVersion;
};
export type GlobalServiceConfig = Record<string, ServiceConfig>;

export interface FeatureConfigurator {
    uiAffect: GeneratedUiAffectConfig[];
    initialize: (version: FeatureVersion) => void;
    getRoutes: () => FeatureRouteConfig;
    getMenu: (config?: GlobalServiceConfig) => GeneratedMenuConfig;
    getRouteMetadata: () => GeneratedRouteMetadataConfig;
}

export interface GeneratedMenuConfig {
    version: FeatureVersion;
    menu: Menu;
    adminMenu?: Menu|null;
}
export type GeneratedMenuSchema = Record<FeatureKeyType, GeneratedMenuConfig>;

type UiAffectConfig = {
    method: string;
    version: string;
};
export interface GeneratedUiAffectConfig {
    feature: string;
    affects: UiAffectConfig[];
}
export type GeneratedUiAffectSchema = Record<FeatureKeyType, Record<string, boolean>>;

export interface RouteVersionInfo {
    name: string;
    params?: Record<string, string>;
}

export interface VersionedRouteConfig {
    V1: RouteVersionInfo;
    V2: RouteVersionInfo;
}

export type GeneratedRouteMetadata = Record<string, VersionedRouteConfig>;
export type GeneratedRouteMetadataConfig = Record<string, RouteVersionInfo>;
export type GeneratedRouteMetadataSchema = Record<string, GeneratedRouteMetadataConfig>;

export interface GeneratedRouteSchema {
    routes: RouteConfig[];
    adminRoutes: RouteConfig[];
}
export interface FeatureRouteConfig {
    routes: RouteConfig|null;
    adminRoutes: RouteConfig|null;
    version?: FeatureVersion;
}

type apiClientType = {
    V1: string;
    V2?: string;
};
export type ApiClientsSchemaType = {
    DASHBOARDS: apiClientType,
    PROJECT: apiClientType,
    SERVICE_ACCOUNT: apiClientType,
    ASSET_INVENTORY: apiClientType,
    COST_ANALYSIS: apiClientType,
    OPS_FLOW: apiClientType,
    ALERT_MANAGER: apiClientType,
};




