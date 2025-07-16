import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ChannelState } from '@/schema/notification/type';

export type UserChannelListParameters = {
    query?: Query
    user_channel_id?: string
    name?: string
    state?: ChannelState
    secret_id?: string
    is_subscribe?: boolean
    is_scheduled?: boolean
    protocol_id?: string
};
