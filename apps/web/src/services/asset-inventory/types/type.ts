import type { TranslateResult } from 'vue-i18n';

import type { AdditionalRuleAction, AdditionalRuleCondition } from '@/schema/inventory/collector-rule/model';

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
    conditions_policy: string;
    conditions: AdditionalRuleCondition[];
    actions: AdditionalRuleAction;
    options?: {
        stop_processing: boolean;
    };
}
