import type { Tags } from '@/api-clients/_common/schema/model';

import type {
    EventRuleActionsType,
    EventRuleConditionsPolicyType,
    EventRuleConditionsType,
    EventRuleOptions,
    EventRuleScopeType,
} from '@/schema/alert-manager/event-rule/type';

export interface EventRuleModel {
    event_rule_id: string;
    name: string;
    scope: EventRuleScopeType;
    order: number;
    conditions: EventRuleConditionsType[];
    conditions_policy: EventRuleConditionsPolicyType;
    actions: EventRuleActionsType;
    options: EventRuleOptions;
    tags: Tags;
    webhook_id: string;
    service_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
