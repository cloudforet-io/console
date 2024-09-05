import type { Tags } from '@/schema/_common/model';
import type { CollectorRuleConditionPolicy, CollectorRuleType, CollectorResourceGroup } from '@/schema/inventory/collector-rule/type';

export interface AdditionalRuleCondition {
    key: string;
    value: string;
    operator: 'eq' | 'contain' | 'not' | 'not_contain';
}

export interface AdditionalRuleAction {
    change_project?: string;
    match_project?: {
        source: string;
        target: string;
    }
    match_service_account?: {
        source: string;
        target: string;
    }
}

export interface CollectorRuleModel {
    collector_rule_id: string;
    name: string;
    rule_type: CollectorRuleType,
    order: number,
    conditions: AdditionalRuleCondition[],
    conditions_policy: CollectorRuleConditionPolicy,
    actions: AdditionalRuleAction,
    options: {
        stop_processing: boolean,
    },
    tags: Tags,
    collector_id: string,
    resource_group: CollectorResourceGroup,
    workspace_id: string,
    created_at: string,
}

