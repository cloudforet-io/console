import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ServiceListParameters {
    service_id?: string;
    name?: string;
    escalation_policy_id?: string;
    query?: Query;
    details?: boolean;
}
