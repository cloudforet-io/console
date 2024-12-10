import type { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_URGENCY } from '@/schema/alert-manager/event-rule/constant';

export type EventRuleConditionsPolicyType = typeof EVENT_RULE_CONDITIONS_POLICY[keyof typeof EVENT_RULE_CONDITIONS_POLICY];
export type EventRuleUrgencyType = typeof EVENT_RULE_URGENCY[keyof typeof EVENT_RULE_URGENCY];

export type EventRuleConditionsType = {
    key: 'title' | 'description' | 'rule' | 'severity' | 'resource' | 'account' | 'webhook_id' | 'project_id' | 'additional_info';
    value: string;
    operator: 'eq' | 'contain' | 'not' | 'not_contain';
};

type EventRuleActionsMatchAssetType = {
    source: string;
};

export type EventRuleActionsType = {
    change_service: string;
    match_asset: EventRuleActionsMatchAssetType;
    change_urgency: EventRuleUrgencyType;
    change_escalation_policy: string;
    additional_info: object;
    no_notification: boolean;
};

export type EventRuleOptions = {
    stop_processing: boolean;
};
