import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType, EventRuleOptions,
    EventRuleScopeType,
} from '@/schema/alert-manager/event-rule/type';

export interface EventRuleCreateParameters {
    name?: string;
    scope: EventRuleScopeType;
    conditions?: EventRuleConditionsType[];
    conditions_policy: EventRuleConditionsPolicyType;
    actions?: EventRuleActionsType;
    options?: EventRuleOptions;
    tags?: Tags;
    service_id: string;
    webhook_id?: string;
}
