import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { UserChannelStateType } from '@/api-clients/alert-manager/user-channel/schema/type';

export interface UserChannelListParameters {
    query?: Query;
    channel_id?: string;
    name?: string;
    state?: UserChannelStateType;
    protocol_id?: string;
}
