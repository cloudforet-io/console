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
