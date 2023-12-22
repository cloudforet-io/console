import type { AlertUrgency } from '@/schema/monitoring/alert/type';

export type EventRuleConditionKey =
    |'title'
    |'description'
    |'rule'
    |'resource_id'
    |'resource_name'
    |'resource_type'
    |'webhook_id'
    |'project_id'
    |string; // string type is for the case of 'additional_info.<key>'

export type EventRuleConditionOperator =
    |'eq'
    |'contain'
    | 'not'
    |'not_contain';

export interface EventRuleCondition {
    key: EventRuleConditionKey;
    value: string;
    operator: EventRuleConditionOperator
}

export type EventRuleConditionsPolicy = 'ALL'|'ANY';

export interface EventRuleActions {
    change_assignee?: string;
    change_urgency?: AlertUrgency;
    change_project?: string;
    add_additional_info?: Record<string, string>;
    no_notification?: boolean;
}

export interface EventRuleOptions {
    stop_processing?: boolean;
}

export type EventRuleResourceGroup = 'WORKSPACE'|'PROJECT';
