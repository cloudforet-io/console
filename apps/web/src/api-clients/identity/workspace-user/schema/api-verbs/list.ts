import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { AuthType, UserState } from '@/api-clients/identity/user/schema/type';


export interface WorkspaceUserListParameters {
    query?: Query;
    user_id?: string;
    name?: string;
    state?: UserState;
    email?: string;
    auth_type?: AuthType;
    workspace_id?: string;
}
