import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { UserGroupChannelStateType } from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelListParameters {
    query?: Query;
    channel_id?: string;
    name?: string;
    state?: UserGroupChannelStateType;
    protocol_id?: string;
    user_group_id?: string
    workspace_id?: string;
}
