import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EventRuleModel } from '@/api-clients/monitoring/event-rule/schema/model';

export interface EventRuleListParameters {
    event_rule_id?: string;
    name?: string;
    resource_group?: EventRuleModel['resource_group'];
    project_id?: string;
    workspace_id?: string;
    query?: Query;
}
