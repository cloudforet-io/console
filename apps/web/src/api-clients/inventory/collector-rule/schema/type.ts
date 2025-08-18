import type {
    COLLECTOR_RULE_TYPE, COLLECTOR_RULE_CONDITION_POLICY, COLLECTOR_RESOURCE_GROUP, COLLECTOR_RULE_CONDITION_OPERATOR,
    COLLECTOR_RULE_CONDITION_KEY,
} from '@/api-clients/inventory/collector-rule/schema/constant';

export type CollectorRuleType = typeof COLLECTOR_RULE_TYPE[keyof typeof COLLECTOR_RULE_TYPE];

export type CollectorRuleConditionPolicy = typeof COLLECTOR_RULE_CONDITION_POLICY[keyof typeof COLLECTOR_RULE_CONDITION_POLICY];

export type CollectorResourceGroup = typeof COLLECTOR_RESOURCE_GROUP[keyof typeof COLLECTOR_RESOURCE_GROUP];

export type CollectorRuleConditionOperator = typeof COLLECTOR_RULE_CONDITION_OPERATOR[keyof typeof COLLECTOR_RULE_CONDITION_OPERATOR];

// e.g ) CollectorRuleConditionKey =  COLLECTOR_RULE_CONDITION_KEY | 'data.xxx' | 'tags.xxx'
export type CollectorRuleConditionKey = typeof COLLECTOR_RULE_CONDITION_KEY[keyof typeof COLLECTOR_RULE_CONDITION_KEY] | string;
