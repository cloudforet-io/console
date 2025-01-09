import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { NotificationProtocolStateType } from '@/schema/alert-manager/notification-protocol/type';

export interface NotificationProtocolListParameters {
    query?: Query;
    protocol_id?: string;
    name?: string;
    state?: NotificationProtocolStateType;
}
