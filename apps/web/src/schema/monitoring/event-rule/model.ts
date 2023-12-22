import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleCondition, EventRuleActions, EventRuleConditionsPolicy, EventRuleOptions, EventRuleResourceGroup,
} from '@/schema/monitoring/event-rule/type';

export interface EventRuleModel {
    event_rule_id: string;
    name: string;
    order: number;
    conditions: EventRuleCondition[];
    conditions_policy: EventRuleConditionsPolicy;
    actions: EventRuleActions;
    options: EventRuleOptions;
    tags: Tags;
    resource_group: EventRuleResourceGroup;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;

}
