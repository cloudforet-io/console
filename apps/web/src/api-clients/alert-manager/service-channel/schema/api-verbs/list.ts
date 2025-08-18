import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type {
    ServiceChannelStateType,
    ServiceChannelType,
} from '@/api-clients/alert-manager/service-channel/schema/type';

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
