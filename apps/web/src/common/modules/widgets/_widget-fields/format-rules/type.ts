import type { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';

export interface FormatRulesValue {
    text?: string;
    threshold?: number;
    color: string;
}

export type FormatRulesType = typeof FORMAT_RULE_TYPE[keyof typeof FORMAT_RULE_TYPE];

export interface FormatRulesOptions {
    formatRulesType: FormatRulesType;
    description?: string;
    default?: FormatRulesValue[];
    baseColor?: string;
}
