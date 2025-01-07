import type { AlertStatusType } from '@/schema/alert-manager/alert/type';
import type { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_URGENCY, EVENT_RULE_SCOPE } from '@/schema/alert-manager/event-rule/constant';

export type EventRuleConditionsPolicyType = typeof EVENT_RULE_CONDITIONS_POLICY[keyof typeof EVENT_RULE_CONDITIONS_POLICY];
export type EventRuleUrgencyType = typeof EVENT_RULE_URGENCY[keyof typeof EVENT_RULE_URGENCY];
export type EventRuleScopeType = typeof EVENT_RULE_SCOPE[keyof typeof EVENT_RULE_SCOPE];

export type EventRuleConditionsKeyType = 'title' | 'description' | 'rule' | 'severity' | 'resource' | 'account' | 'webhook_id' | 'project_id' | 'additional_info';
export type EventRuleConditionsOperatorType = 'eq' | 'contain' | 'not' | 'not_contain';

export type EventRuleConditionsType = {
    key: EventRuleConditionsKeyType;
    value: string;
    operator: EventRuleConditionsOperatorType;
};

type EventRuleActionsMatchAssetType = {
    rule: Record<string, any>;
    asset_types: string[];
};

export type EventRuleActionsType = {
    // service settings
    change_service?: string;
    // asset settings
    match_asset?: EventRuleActionsMatchAssetType;
    // alert settings
    change_title?: string;
    change_urgency?: EventRuleUrgencyType;
    change_escalation_policy?: string;
    additional_info?: object;
    change_status?: AlertStatusType;
    set_labels: string[];
};

export type EventRuleOptions = {
    stop_processing: boolean;
};
