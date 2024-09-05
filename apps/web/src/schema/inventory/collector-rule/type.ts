import type { COLLECTOR_RULE_TYPE, COLLECTOR_RULE_CONDITION_POLICY, COLLECTOR_RESOURCE_GROUP } from '@/schema/inventory/collector-rule/constant';

export type CollectorRuleType = typeof COLLECTOR_RULE_TYPE[keyof typeof COLLECTOR_RULE_TYPE];

export type CollectorRuleConditionPolicy = typeof COLLECTOR_RULE_CONDITION_POLICY[keyof typeof COLLECTOR_RULE_CONDITION_POLICY];

export type CollectorResourceGroup = typeof COLLECTOR_RESOURCE_GROUP[keyof typeof COLLECTOR_RESOURCE_GROUP];
