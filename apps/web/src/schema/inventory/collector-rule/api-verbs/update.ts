import type { Tags } from '@/api-clients/_common/schema/model';
import type { AdditionalRuleAction, AdditionalRuleCondition } from '@/schema/inventory/collector-rule/model';
import type { CollectorRuleConditionPolicy } from '@/schema/inventory/collector-rule/type';

// collector api parameters
export interface CollectorRuleUpdateParameters {
    collector_rule_id: string;
    name?: string;
    conditions?: AdditionalRuleCondition[];
    conditions_policy?: CollectorRuleConditionPolicy;
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
    tags?: Tags;
}
