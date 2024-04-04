import type { PeriodDropdownMenu, PeriodDropdownMenuItem } from '@/services/cost-explorer/types/cost-analysis-period-type';


export const PERIOD_DROPDOWN_MENU = {
    CURRENT_MONTH: 'CURRENT_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    LAST_3_MONTHS: 'LAST_3_MONTHS',
    LAST_6_MONTHS: 'LAST_6_MONTHS',
    LAST_12_MONTHS: 'LAST_12_MONTHS',
    CURRENT_YEAR: 'CURRENT_YEAR',
    LAST_YEAR: 'LAST_YEAR',
    LAST_3_YEARS: 'LAST_3_YEARS',
} as const;

export const PERIOD_DROPDOWN_MENU_ITEM_MAP: Record<PeriodDropdownMenu, PeriodDropdownMenuItem> = {
    // DAILY
    [PERIOD_DROPDOWN_MENU.CURRENT_MONTH]: {
        name: PERIOD_DROPDOWN_MENU.CURRENT_MONTH,
        relativePeriod: { unit: 'month', value: 0, include_today: true },
    },
    [PERIOD_DROPDOWN_MENU.LAST_MONTH]: {
        name: PERIOD_DROPDOWN_MENU.LAST_MONTH,
        relativePeriod: { unit: 'month', value: 1, include_today: false },
    },
    // MONTHLY
    [PERIOD_DROPDOWN_MENU.LAST_3_MONTHS]: {
        name: PERIOD_DROPDOWN_MENU.LAST_3_MONTHS,
        relativePeriod: { unit: 'month', value: 2, include_today: true },
    },
    [PERIOD_DROPDOWN_MENU.LAST_6_MONTHS]: {
        name: PERIOD_DROPDOWN_MENU.LAST_6_MONTHS,
        relativePeriod: { unit: 'month', value: 5, include_today: true },
    },
    [PERIOD_DROPDOWN_MENU.LAST_12_MONTHS]: {
        name: PERIOD_DROPDOWN_MENU.LAST_12_MONTHS,
        relativePeriod: { unit: 'month', value: 11, include_today: true },
    },
    [PERIOD_DROPDOWN_MENU.CURRENT_YEAR]: {
        name: PERIOD_DROPDOWN_MENU.CURRENT_YEAR,
        relativePeriod: { unit: 'year', value: 0, include_today: true },
    },
    [PERIOD_DROPDOWN_MENU.LAST_YEAR]: {
        name: PERIOD_DROPDOWN_MENU.LAST_YEAR,
        relativePeriod: { unit: 'year', value: 1, include_today: false },
    },
    // YEARLY
    [PERIOD_DROPDOWN_MENU.LAST_3_YEARS]: {
        name: PERIOD_DROPDOWN_MENU.LAST_3_YEARS,
        relativePeriod: { unit: 'year', value: 2, include_today: true },
    },
};
