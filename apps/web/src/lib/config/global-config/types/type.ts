import type { FEATURES } from '@/lib/config/global-config/constants/constants';
import type { MenuId } from '@/lib/menu/config';

export type GlobalServiceConfig = Record<string, { ENABLED: boolean; VERSION: string }>;

export type FeatureKeyType = typeof FEATURES[keyof typeof FEATURES];

type MenuConfig = Partial<Record<MenuId, boolean>>;
export type FeatureVersionSettingsType = {
    menu: MenuConfig;
    adminMenu?: MenuConfig;
    uiAffects?: Record<string, boolean>;
};
type FeatureSettingType = {
    currentVersion: string;
    V1: FeatureVersionSettingsType;
    V2?: FeatureVersionSettingsType;
};
export type FeatureSchemaType = Record<FeatureKeyType, FeatureSettingType>;

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
