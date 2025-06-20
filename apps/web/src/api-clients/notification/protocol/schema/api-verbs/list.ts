import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ProtocolState } from '@/api-clients/notification/protocol/schema/type';

export interface ProtocolListParameters {
    protocol_id?: string;
    name?: string;
    state?: ProtocolState;
    protocol_type?: string;
    query?: Query;
}
