import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType, EventRuleOptions,
    EventRuleScopeType,
} from '@/api-clients/alert-manager/event-rule/schema/type';

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
