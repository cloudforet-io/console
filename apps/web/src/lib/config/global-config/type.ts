import type { FEATURES } from '@/lib/config/global-config/constants';
import type { MenuId } from '@/lib/menu/config';

export type GlobalServiceConfig = Record<string, { ENABLED: boolean; VERSION: string }>;

type FeatureKeyType = typeof FEATURES[keyof typeof FEATURES];

type UIEffectsType = {
    showAlert?: boolean;
};
export type FeatureVersionSettingsType = {
    menu: Record<MenuId, boolean>;
    adminMenu: Record<MenuId, boolean>;
    uiAffects?: UIEffectsType;
};
type FeatureSettingType = {
    currentVersion: string;
    V1: FeatureVersionSettingsType;
    V2?: FeatureVersionSettingsType;
    uiAffects?: UIEffectsType;
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
