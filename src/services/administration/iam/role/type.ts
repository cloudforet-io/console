import type { DefinitionField } from '@spaceone/design-system/dist/src/data-display/tables/definition-table/type';
import type { Timestamp } from '@spaceone/design-system/dist/src/util/type';
import type { TranslateResult } from 'vue-i18n';

import type { Tags } from '@/models';

import type { PagePermission, PagePermissionType } from '@/lib/access-control/page-permission-helper';

import type { RoleType } from '@/services/administration/iam/role/config';

export interface Policy {
    policy_id: string;
    policy_type: string;
}

export interface RoleData {
    created_at: Timestamp;
    deleted_at?: Timestamp;
    domain_id: string;
    name: string;
    policies?: Policy[];
    page_permissions: PagePermission[];
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
