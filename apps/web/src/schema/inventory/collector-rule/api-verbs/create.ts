import type { Tags } from '@/schema/_common/model';
import type { AdditionalRuleAction, AdditionalRuleCondition } from '@/schema/inventory/collector-rule/model';
import type { CollectorRuleConditionPolicy } from '@/schema/inventory/collector-rule/type';

export interface CollectorRuleCreateParameters {
    collector_id: string;
    name?: string;
    conditions?: AdditionalRuleCondition[];
    conditions_policy?: CollectorRuleConditionPolicy;
    actions: AdditionalRuleAction[];
    options?: {
        stop_processing: boolean;
    };
    tags?: Tags;
}
