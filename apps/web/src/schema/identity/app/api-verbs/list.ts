import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { AppStatusType } from '@/schema/identity/app/type';
import type { RoleType } from '@/schema/identity/role/type';

export interface AppListParameters {
    query?: Query;
    app_id?: string;
    name?: string;
    state?: AppStatusType;
    role_type?: RoleType;
    role_id?: string;
    api_key_id?: string;
    resource_group?: ResourceGroupType;
}
