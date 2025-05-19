import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type {
    ServiceChannelStateType,
    ServiceChannelType,
} from '@/schema/alert-manager/service-channel/type';

export interface ServiceChannelListParameters {
    query?: Query;
    channel_id?: string;
    name?: string;
    state?: ServiceChannelStateType;
    channel_type?: ServiceChannelType;
    protocol_id?: string;
    service_id?: string;
    workspace_id?: string;
}
