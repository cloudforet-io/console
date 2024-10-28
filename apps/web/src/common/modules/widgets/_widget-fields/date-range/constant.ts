
export const DATE_RANGE_MONTHLY_VALUE_MAP = {
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    lastTwoMonths: 'Last 2 Months',
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
    lastTwoYears: 'Last 2 Years',
} as const;

export const DATE_RANGE_YEARLY_VALUES = Object.keys(DATE_RANGE_YEARLY_VALUE_MAP);
