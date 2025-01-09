import type { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';

export interface ThresholdValue {
    text?: string;
    number?: number;
    color: string;
}

export interface FormatRulesValue {
    field?: string;
    rules: ThresholdValue[];
    baseColor?: string;
}

export interface FormatRulesOptions {
    useField?: boolean;
    dataTarget?: FieldDataTargetType;
    dependentField?: string; // groupBy field, xAxis field, yAxis field.. etc.
    formatRulesType: FormatRulesType;
    description?: string;
    baseColor?: string;
    default?: ThresholdValue[];
}

export type FormatRulesType = typeof FORMAT_RULE_TYPE[keyof typeof FORMAT_RULE_TYPE];
