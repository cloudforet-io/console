import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type {
    EventRuleCondition, EventRuleActions, EventRuleConditionsPolicy, EventRuleOptions,
} from '@/api-clients/monitoring/event-rule/schema/type';

export interface EventRuleModel {
    event_rule_id: string;
    name: string;
    order: number;
    conditions: EventRuleCondition[];
    conditions_policy: EventRuleConditionsPolicy;
    actions: EventRuleActions;
    options: EventRuleOptions;
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;

}
