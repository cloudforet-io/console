import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface CollectorRuleListParameters {
    query?: Query;
    collector_rule_id?: string;
    name?: string;
    rule_type?: string;
    collector_id?: string;
    workspace_id?: string;
}
