import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { AppStatusType } from '@/api-clients/identity/app/schema/type';
import type { RoleType } from '@/api-clients/identity/role/type';

export interface AppListParameters {
    query?: Query;
    app_id?: string;
    name?: string;
    state?: AppStatusType;
    role_type?: RoleType;
    role_id?: string;
    api_key_id?: string;
    workspace_id?: string;
}
