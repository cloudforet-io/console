import type { Tags } from '@/schema/_common/model';
import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType,
    EventRuleOptions,
} from '@/schema/alert-manager/event-rule/type';

export interface EventRuleModel {
    event_rule_id: string;
    name: string;
    order: number;
    conditions: EventRuleConditionsType[];
    conditions_policy: EventRuleConditionsPolicyType;
    actions: EventRuleActionsType;
    options: EventRuleOptions;
    tags: Tags;
    service_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
