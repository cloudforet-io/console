import type { TranslateResult } from 'vue-i18n';

import type { RoleType } from '@/schema/identity/role/type';

export interface RoleFormData {
    name?: string;
    role_type?: RoleType;
    page_access?: string[];
    permissions?: string[];
}

// Page Access
export interface TableItem {
    id: string;
    service: TranslateResult;
    page_access?: string;
    accessible_menu?: PageAccessMenuItem[];
}
export interface PageAccessMenuItem {
    id: string;
    translationIds?: string[];
    isAccessible: boolean;
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
