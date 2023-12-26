import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleActions, EventRuleCondition,
    EventRuleConditionsPolicy, EventRuleOptions, EventRuleResourceGroup,
} from '@/schema/monitoring/event-rule/type';

export interface EventRuleCreateParameters {
    conditions: EventRuleCondition[];
    conditions_policy: EventRuleConditionsPolicy;
    actions: EventRuleActions;
    resource_group: EventRuleResourceGroup;
    name?: string;
    project_id?: string;
    options?: EventRuleOptions;
    tags?: Tags;
}
