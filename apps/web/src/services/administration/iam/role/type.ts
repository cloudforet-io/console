import type { TranslateResult } from 'vue-i18n';

import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';

import type { Tags, TimeStamp } from '@/models';

import type { PagePermissionType, RawPagePermission } from '@/lib/access-control/config';

import type { RoleType } from '@/services/administration/iam/role/config';

export interface Policy {
    policy_id: string;
    policy_type: string;
}

export interface RoleData {
    created_at: TimeStamp;
    deleted_at?: TimeStamp;
    domain_id: string;
    name: string;
    policies?: Policy[];
    page_permissions: RawPagePermission[];
    role_id: string;
    role_type: RoleType;
    tags?: Tags; // [ description: string ]
}

// Page Access
export interface PageAccessMenuItem {
    id: string;
    translationIds: string[];
    isViewed: boolean;
    isManaged: boolean;
    isParent?: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}
export interface PageAccessDefinitionTableData {
    label?: TranslateResult;
    data: Record<string, PagePermissionType | '--'>;
    fields: DefinitionField[];
}
