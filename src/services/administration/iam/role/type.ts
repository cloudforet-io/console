import { DefinitionField } from '@spaceone/design-system/dist/src/data-display/tables/definition-table/type';
import { Timestamp } from '@spaceone/design-system/dist/src/util/type';
import { TranslateResult } from 'vue-i18n';

import { Tags } from '@/models';

import { PagePermission, PagePermissionType } from '@/lib/access-control/page-permission-helper';

import { RoleType } from '@/services/administration/iam/role/config';

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
    labels: string[] | TranslateResult[];
    isViewed: boolean;
    isManaged: boolean;
    isParent?: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}
export interface PageAccessDefinitionTableData {
    label?: string;
    data: Record<string, PagePermissionType | '--'>;
    fields: DefinitionField[];
}
