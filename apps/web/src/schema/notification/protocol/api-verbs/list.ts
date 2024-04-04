import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ProtocolState } from '@/schema/notification/protocol/type';

export interface ProtocolListParameters {
    protocol_id?: string;
    name?: string;
    state?: ProtocolState;
    protocol_type?: string;
    query?: Query;
}
