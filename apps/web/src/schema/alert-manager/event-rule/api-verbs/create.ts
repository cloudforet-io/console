import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType, EventRuleOptions,
} from '@/schema/alert-manager/event-rule/type';

export interface EventRuleCreateParameters {
    name?: string;
    conditions?: EventRuleConditionsType[];
    conditions_policy: EventRuleConditionsPolicyType;
    actions: EventRuleActionsType;
    options?: EventRuleOptions;
    tags?: Tags;
    service_id: string;
}
