import type { RoleType } from '@/schema/identity/role/type';

export interface RoleFormData {
    name?: string;
    role_type?: RoleType;
    page_access?: string[];
    permissions?: string[];
}

// Page Access
export interface PageAccessMenuItem {
    id: string;
    translationIds: string[];
    isAccessible: boolean;
    isParent?: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}

export type UpdateFormDataType = {
    id: string;
    val: boolean;
    isHideMenu?: boolean;
};
