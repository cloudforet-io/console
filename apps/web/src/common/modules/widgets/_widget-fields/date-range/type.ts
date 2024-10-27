import type {
    DATE_RANGE_MONTHLY_VALUE_MAP, DATE_RANGE_YEARLY_VALUE_MAP, DATE_RANGE_DAILY_VALUE_MAP,
} from '@/common/modules/widgets/_widget-fields/date-range/constant';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateRangeOptions {
    //
}

export type DateRangeValue = InheritDateRangeValue | DisnheritDateRangeValue;

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
    }
}

interface DisnheritDateRangeValue extends BaseDateRangeValue {
    inherit: false;
    options: {
        value: DateRangeValueType;
        start?: string; // "2024-01-01"
        end?: string; // "2024-12-31"
    }
}

export type DateRangeValueType = 'auto'
    | DateRangeMonthlyValueType
    | DateRangeDailyValueType
    | DateRangeYearlyValueType
    | 'custom';

type DateRangeMonthlyValueType = keyof typeof DATE_RANGE_MONTHLY_VALUE_MAP;
type DateRangeDailyValueType = keyof typeof DATE_RANGE_DAILY_VALUE_MAP;
type DateRangeYearlyValueType = keyof typeof DATE_RANGE_YEARLY_VALUE_MAP;
