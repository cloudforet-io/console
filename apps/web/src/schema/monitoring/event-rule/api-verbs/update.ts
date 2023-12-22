import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleActions, EventRuleCondition,
    EventRuleConditionsPolicy, EventRuleOptions,
} from '@/schema/monitoring/event-rule/type';

export interface EventRuleUpdateParameters {
    event_rule_id: string;
    name?: string;
    conditions?: EventRuleCondition[];
    conditions_policy?: EventRuleConditionsPolicy;
    actions?: EventRuleActions;
    options?: EventRuleOptions;
    tags?: Tags;
}
