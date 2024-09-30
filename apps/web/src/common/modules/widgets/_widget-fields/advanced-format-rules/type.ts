import type { ADVANCED_FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';

export interface AdvancedFormatRulesValue {
    field?: string;
    value: FormatRulesValue[];
    baseColor?: string;
}

export type AdvancedFormatRulesType = typeof ADVANCED_FORMAT_RULE_TYPE[keyof typeof ADVANCED_FORMAT_RULE_TYPE];

export interface AdvancedFormatRulesOptions {
    formatRulesType: AdvancedFormatRulesType;
    description?: string;
    baseColor?: string;
}
