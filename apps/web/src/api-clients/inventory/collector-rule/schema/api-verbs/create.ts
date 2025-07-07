import type { Tags } from '@/api-clients/_common/schema/model';
import type { AdditionalRuleAction, AdditionalRuleCondition } from '@/api-clients/inventory/collector-rule/schema/model';
import type { CollectorRuleConditionPolicy } from '@/api-clients/inventory/collector-rule/schema/type';

export interface CollectorRuleCreateParameters {
    collector_id: string;
    name?: string;
    conditions?: AdditionalRuleCondition[];
    conditions_policy?: CollectorRuleConditionPolicy;
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
    tags?: Tags;
}
