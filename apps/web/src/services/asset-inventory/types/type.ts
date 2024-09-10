import type { TranslateResult } from 'vue-i18n';

import type { AdditionalRuleAction, AdditionalRuleCondition } from '@/schema/inventory/collector-rule/model';
import type { CollectorRuleConditionPolicy } from '@/schema/inventory/collector-rule/type';

export interface Period {
    start?: string;
    end?: string;
}

export interface EmptyData {
    to: { name?: string };
    buttonText?: string|TranslateResult;
    desc: string|TranslateResult;
}

export interface CollectorRuleForm {
    collector_rule_id?: string;
    conditions_policy: CollectorRuleConditionPolicy;
    conditions: AdditionalRuleCondition[];
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
}
