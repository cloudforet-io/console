import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ProtocolState } from '@/schema/notification/protocol/type';

export interface ProtocolListParameters {
    query?: Query;
    protocol_id?: string;
    name?: string;
    state?: ProtocolState;
    // protocol_type?: string;
}
