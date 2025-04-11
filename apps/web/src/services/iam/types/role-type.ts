import type { TranslateResult } from 'vue-i18n';

import type { RoleType } from '@/api-clients/identity/role/type';

import type { FeatureKeyType } from '@/lib/config/global-config/types/type';
import type { MenuId } from '@/lib/menu/config';

export interface RoleFormData {
    name?: string;
    role_type?: RoleType;
    page_access?: string[];
    permissions?: string[];
    valid?: boolean;
}

// Page Access
export interface TableItem {
    id: string;
    service: TranslateResult;
    page_access?: string;
    accessible_menu_list?: PageAccessMenuItem[];
    isInValid?: boolean
}
export interface PageAccessMenuByConfig {
    id: MenuId,
    key?: FeatureKeyType,
    subMenuList?: PageAccessMenuItem[];
}
export interface PageAccessMenuItem {
    id: string;
    translationIds?: string[];
    isAccessible?: boolean;
    isParent?: boolean;
    subMenuList?: PageAccessMenuItem[];
    accessType?: string;
    isValid?: boolean;
    accessMenuList?: string[];
}

export type UpdateFormDataType = {
    id: string;
    val?: boolean;
    type?: string;
};
export type AccessType = {
    label: TranslateResult;
    icon: string;
};
