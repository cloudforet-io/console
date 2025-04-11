import type { RouteConfig } from 'vue-router';

import type { FEATURES } from '@/lib/config/global-config/constants/constants';
import type { Menu } from '@/lib/menu/config';

export type FeatureVersion = 'V1' | 'V2';
export type GlobalServiceConfig = Record<string, { ENABLED: boolean; VERSION: FeatureVersion}>;

export type FeatureKeyType = typeof FEATURES[keyof typeof FEATURES];

export interface FeatureMenuConfig {
    version?: FeatureVersion;
    menu: Menu;
    adminMenu?: Menu|null;
    uiAffects?: Record<string, boolean>;
}
export interface FeatureRouteConfig {
    routes: RouteConfig|null;
    adminRoutes: RouteConfig|null;
    version?: FeatureVersion;
}

export type FeatureSchemaType = Record<FeatureKeyType, FeatureMenuConfig>;

type apiClientType = {
    V1: string;
    V2?: string;
};
export type ApiClientsSchemaType = {
    DASHBOARDS: apiClientType,
    PROJECT: apiClientType,
    ASSET_INVENTORY: apiClientType,
    COST_ANALYSIS: apiClientType,
    OPS_FLOW: apiClientType,
    ALERT_MANAGER: apiClientType,
};

export interface FeatureConfiguratorType {
    getRoutes: () => FeatureRouteConfig;
    getMenu: (config?: GlobalServiceConfig) => FeatureMenuConfig;
    initialize: (version: FeatureVersion) => void;
    uiAffect: FeatureUiAffect[];
}

interface UiAffectConfig {
    method: string;
    version: string;
}

export interface FeatureUiAffect {
    feature: string;
    affects: UiAffectConfig[];
}
