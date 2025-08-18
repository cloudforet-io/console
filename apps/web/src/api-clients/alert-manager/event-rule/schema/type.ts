import type { AlertStatusType } from '@/api-clients/alert-manager/alert/schema/type';
import type { EVENT_RULE_CONDITIONS_POLICY, EVENT_RULE_URGENCY, EVENT_RULE_SCOPE } from '@/api-clients/alert-manager/event-rule/schema/constants';

export type EventRuleConditionsPolicyType = typeof EVENT_RULE_CONDITIONS_POLICY[keyof typeof EVENT_RULE_CONDITIONS_POLICY];
export type EventRuleUrgencyType = typeof EVENT_RULE_URGENCY[keyof typeof EVENT_RULE_URGENCY];
export type EventRuleScopeType = typeof EVENT_RULE_SCOPE[keyof typeof EVENT_RULE_SCOPE];

export type EventRuleConditionsKeyType = 'title' | 'description' | 'rule' | 'severity' | 'account' | 'additional_info' | 'labels' | 'period';
export type EventRuleConditionsOperatorType = 'eq' | 'contain' | 'not' | 'not_contain' | 'size_gte' | 'size_lte';

export type EventRuleConditionsType = {
    key: EventRuleConditionsKeyType|string;
    value: any;
    operator: EventRuleConditionsOperatorType;
};

export type EventRuleActionsMatchAssetType = {
    key?: string;
    asset_types?: string[];
    create_temporary_asset?: boolean;
};

export type EventRuleActionsMergeAssetLabelsType = {
    period?: number
};

export type EventRuleActionsType = {
    // service settings
    change_service?: string;
    // asset settings
    match_asset?: EventRuleActionsMatchAssetType;
    merge_asset_labels?: EventRuleActionsMergeAssetLabelsType;
    // alert settings
    change_title?: string;
    change_urgency?: EventRuleUrgencyType;
    change_escalation_policy?: string;
    add_additional_info?: object;
    change_status?: AlertStatusType;
    set_labels?: string[];
};

export type EventRuleOptions = {
    stop_processing: boolean;
};
