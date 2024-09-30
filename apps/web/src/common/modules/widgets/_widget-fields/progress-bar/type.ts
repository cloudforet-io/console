import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';

export interface ProgressBarValue {
    fieldName: string;
    basisField?: string;
    totalField?: string;
    formatRules?: FormatRulesValue[];
    baseColor?: string;
}


export interface ProgressBarOptions {
    defaultFormatRules?: FormatRulesValue[];
    baseColor?: string;
}
