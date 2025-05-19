import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { UserChannelStateType } from '@/schema/alert-manager/user-channel/type';

export interface UserChannelListParameters {
    query?: Query;
    channel_id?: string;
    name?: string;
    state?: UserChannelStateType;
    protocol_id?: string;
}
