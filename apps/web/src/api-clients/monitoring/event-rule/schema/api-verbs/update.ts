import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    EventRuleActions, EventRuleCondition,
    EventRuleConditionsPolicy, EventRuleOptions,
} from '@/api-clients/monitoring/event-rule/schema/type';

export interface EventRuleUpdateParameters {
    event_rule_id: string;
    name?: string;
    conditions?: EventRuleCondition[];
    conditions_policy?: EventRuleConditionsPolicy;
    actions?: EventRuleActions;
    options?: EventRuleOptions;
    tags?: Tags;
}
