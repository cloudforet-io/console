import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EventRuleResourceGroup } from '@/schema/monitoring/event-rule/type';

export interface EventRuleListParameters {
    event_rule_id?: string;
    name?: string;
    resource_group?: EventRuleResourceGroup;
    project_id?: string;
    workspace_id?: string;
    query?: Query;
}
