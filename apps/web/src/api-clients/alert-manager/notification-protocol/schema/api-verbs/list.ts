import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { NotificationProtocolStateType } from '@/api-clients/alert-manager/notification-protocol/schema/type';

export interface NotificationProtocolListParameters {
    query?: Query;
    protocol_id?: string;
    name?: string;
    state?: NotificationProtocolStateType;
}
