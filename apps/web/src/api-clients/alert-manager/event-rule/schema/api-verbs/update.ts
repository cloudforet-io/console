import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType, EventRuleOptions,
} from '@/api-clients/alert-manager/event-rule/schema/type';

export interface EventRuleUpdateParameters {
    event_rule_id: string;
    name?: string;
    conditions?: EventRuleConditionsType[];
    conditions_policy?: EventRuleConditionsPolicyType;
    actions?: EventRuleActionsType;
    options?: EventRuleOptions;
    tags?: Tags;
}
