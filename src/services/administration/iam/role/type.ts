import { Timestamp } from '@spaceone/design-system/dist/src/util/type';
import { Tags } from '@/models';
import { ROLE_TYPE } from '@/services/administration/iam/role/config';
import { TranslateResult } from 'vue-i18n';
import { PagePermission } from '@/lib/access-control/page-permission-helper';

interface Policy {
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
    role_type: ROLE_TYPE;
    tags?: Tags; // [ description: string ]
}

// Page Access
export interface PageAccessMenuItem {
    id: string;
    labels: string[] | TranslateResult[];
    isViewed: boolean;
    isManaged: boolean;
    hideMenu: boolean;
    subMenuList?: PageAccessMenuItem[];
}
