import type {
    DATE_RANGE_MONTHLY_VALUE_MAP, DATE_RANGE_YEARLY_VALUE_MAP, DATE_RANGE_DAILY_VALUE_MAP, DATE_RANGE_ADVANCED_OPERATOR_MAP,
} from '@/common/modules/widgets/_widget-fields/date-range/constant';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateRangeOptions {
    //
}

export type DateRangeValue = InheritDateRangeValue | DisinheritDateRangeValue;

interface BaseDateRangeValue {
    inherit: boolean;
    options: {
        value: DateRangeValueType;
        start?: string|number; // value "custom" only
        end?: string|number; // value "custom" only
    }
}

interface InheritDateRangeValue extends BaseDateRangeValue {
    inherit: true;
    options: {
        value: DateRangeValueType;
        start?: number; // granularity MONTHLY 1 ~ 12
        end?: number; // granularity MONTHLY 1 ~ 12
        start_operator?: DateRangeAdvancedOperator;
        end_operator?: DateRangeAdvancedOperator;
    }
}

interface DisinheritDateRangeValue extends BaseDateRangeValue {
    inherit: false;
    options: {
        value: DateRangeValueType;
        start?: string|number; // custom case - "2024-01-01" / advanced case - 0
        end?: string|number; // custom case - "2024-12-31" / advanced case - 0
        start_operator?: DateRangeAdvancedOperator;
        end_operator?: DateRangeAdvancedOperator;
    }
}

export type DateRangeAdvancedOperator = keyof typeof DATE_RANGE_ADVANCED_OPERATOR_MAP;

export type DateRangeValueType = 'auto'
    | DateRangeMonthlyValueType
    | DateRangeDailyValueType
    | DateRangeYearlyValueType
    | 'custom' | 'advanced';

type DateRangeMonthlyValueType = keyof typeof DATE_RANGE_MONTHLY_VALUE_MAP;
type DateRangeDailyValueType = keyof typeof DATE_RANGE_DAILY_VALUE_MAP;
type DateRangeYearlyValueType = keyof typeof DATE_RANGE_YEARLY_VALUE_MAP;
