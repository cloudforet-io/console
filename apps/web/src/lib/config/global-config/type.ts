import type { FEATURES } from '@/lib/config/global-config/constants';
import type { MenuId } from '@/lib/menu/config';

export type GlobalServiceConfig = Record<string, { ENABLED: boolean; VERSION: string }>;

type FeatureKeyType = typeof FEATURES[keyof typeof FEATURES];

type MenuConfig = Partial<Record<MenuId, boolean>>;
export type FeatureVersionSettingsType = {
    menu: MenuConfig;
    adminMenu: MenuConfig;
    uiAffects?: Record<string, boolean>;
};
type FeatureSettingType = {
    currentVersion: string;
    V1: FeatureVersionSettingsType;
    V2?: FeatureVersionSettingsType;
};
export type FeatureSchemaType = Record<FeatureKeyType, FeatureSettingType>;

