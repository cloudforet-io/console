export const GRANULARITY = {
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY',
} as const;

export const OPERATOR = {
    SUM: 'sum',
    AVG: 'average',
    MAX: 'max',
    MIN: 'min',
} as const;

export const METRIC_PERIOD_MENU = {
    LAST_7_DAYS: 'LAST_7_DAYS',
    LAST_14_DAYS: 'LAST_14_DAYS',
    LAST_30_DAYS: 'LAST_30_DAYS',
    CURRENT_MONTH: 'CURRENT_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    LAST_3_MONTHS: 'LAST_3_MONTHS',
    LAST_6_MONTHS: 'LAST_6_MONTHS',
    LAST_12_MONTHS: 'LAST_12_MONTHS',
    CURRENT_YEAR: 'CURRENT_YEAR',
    LAST_YEAR: 'LAST_YEAR',
} as const;

export const METRIC_PERIOD_MENU_ITEM_MAP = {
    // DAILY
    [METRIC_PERIOD_MENU.LAST_7_DAYS]: {
        name: METRIC_PERIOD_MENU.LAST_7_DAYS,
        relativePeriod: { unit: 'day', value: 6, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_14_DAYS]: {
        name: METRIC_PERIOD_MENU.LAST_14_DAYS,
        relativePeriod: { unit: 'day', value: 13, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_30_DAYS]: {
        name: METRIC_PERIOD_MENU.LAST_30_DAYS,
        relativePeriod: { unit: 'day', value: 29, include_today: true },
    },
    [METRIC_PERIOD_MENU.CURRENT_MONTH]: {
        name: METRIC_PERIOD_MENU.CURRENT_MONTH,
        relativePeriod: { unit: 'month', value: 0, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_MONTH]: {
        name: METRIC_PERIOD_MENU.LAST_MONTH,
        relativePeriod: { unit: 'month', value: 1, include_today: false },
    },
    // MONTHLY
    [METRIC_PERIOD_MENU.LAST_3_MONTHS]: {
        name: METRIC_PERIOD_MENU.LAST_3_MONTHS,
        relativePeriod: { unit: 'month', value: 2, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_6_MONTHS]: {
        name: METRIC_PERIOD_MENU.LAST_6_MONTHS,
        relativePeriod: { unit: 'month', value: 5, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_12_MONTHS]: {
        name: METRIC_PERIOD_MENU.LAST_12_MONTHS,
        relativePeriod: { unit: 'month', value: 11, include_today: true },
    },
    [METRIC_PERIOD_MENU.CURRENT_YEAR]: {
        name: METRIC_PERIOD_MENU.CURRENT_YEAR,
        relativePeriod: { unit: 'year', value: 0, include_today: true },
    },
    [METRIC_PERIOD_MENU.LAST_YEAR]: {
        name: METRIC_PERIOD_MENU.LAST_YEAR,
        relativePeriod: { unit: 'year', value: 1, include_today: false },
    },
} as const;

export const CHART_TYPE = {
    LINE_AREA: 'LINE_AREA',
    LINE: 'LINE',
    COLUMN: 'COLUMN',
    TREEMAP: 'TREEMAP',
    DONUT: 'DONUT',
} as const;

export const NAME_FORM_MODAL_TYPE = {
    // metric
    ADD_EXAMPLE: 'ADD_EXAMPLE',
    EDIT_NAME: 'EDIT_NAME',
    SAVE_AS_CUSTOM_METRIC: 'SAVE_AS_METRIC',
    // example
    SAVE_AS_EXAMPLE: 'SAVE_AS_EXAMPLE',
} as const;

export const SIZE_UNITS = ['bytes', 'Bytes', 'b', 'gb', 'kb', 'mb', 'pb', 'tb', 'B', 'GB', 'KB', 'MB', 'PB', 'TB'];

export const PROJECT_GROUP_LABEL_INFO = {
    name: 'Project Group',
    key: 'project_group_id',
    reference: {
        resource_type: 'identity.ProjectGroup',
        reference_key: 'project_group_id',
    },
} as const;
