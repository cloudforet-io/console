export const DATE_FIELD = {
    DATE: 'Date',
    YEAR: 'Year',
    MONTH: 'Month',
    DAY: 'Day',
};

export const REFERENCE_FIELD_MAP = {
    Project: 'project',
    Workspace: 'workspace',
    Region: 'region',
    'Service Account': 'serviceAccount',
} as const;

export const WIDGET_LOAD_STALE_TIME = 1000 * 60 * 10;
