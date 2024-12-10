import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface EventRuleListParameters {
    query?: Query;
    event_rule_id?: string;
    name?: string;
    service_id?: string;
    workspace_id?: string;
}
