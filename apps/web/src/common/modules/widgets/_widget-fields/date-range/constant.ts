
export const DATE_RANGE_MONTHLY_VALUE_MAP = {
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisQuarter: 'This Quarter',
    lastQuarter: 'Last Quarter',
} as const;

export const DATE_RANGE_MONTHLY_VALUES = Object.keys(DATE_RANGE_MONTHLY_VALUE_MAP);

export const DATE_RANGE_DAILY_VALUE_MAP = {
    today: 'Today',
    yesterday: 'Yesterday',
    lastTwoDays: 'Last 2 Days',
    lastSevenDays: 'Last 7 Days',
    lastFourteenDays: 'Last 14 Days',
    lastThirtyDays: 'Last 30 Days',
    thisWeek: 'This Week',
    thisWeekToDate: 'This Week to Date',
    lastWeek: 'Last Week',
} as const;

export const DATE_RANGE_DAILY_VALUES = Object.keys(DATE_RANGE_DAILY_VALUE_MAP);

export const DATE_RANGE_YEARLY_VALUE_MAP = {
    thisYear: 'This Year',
    lastYear: 'Last Year',
} as const;

export const DATE_RANGE_YEARLY_VALUES = Object.keys(DATE_RANGE_YEARLY_VALUE_MAP);

export const DATE_RANGE_ADVANCED_OPERATOR_MAP = {
    ADD: 'ADD',
    SUBSTRACT: 'SUBSTRACT',
} as const;

export const MONTHLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_MONTHLY_VALUES, 'custom', 'advanced'];
export const DAILY_ENABLED_VALUES = ['auto', ...DATE_RANGE_DAILY_VALUES, 'custom', 'advanced'];
export const YEARLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_YEARLY_VALUES, 'custom', 'advanced'];
