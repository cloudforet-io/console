import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ChannelState } from '@/schema/notification/type';

export type ProjectChannelListParameters = {
    query?: Query
    project_channel_id?: string
    name?: string
    state?: ChannelState
    is_subscribe?: boolean
    is_scheduled?: boolean
    notification_level?: NotificationLevel
    secret_id?: string
    protocol_id?: string
    project_id?: string
};
