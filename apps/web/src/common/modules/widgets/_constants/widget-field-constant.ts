import { green, red } from '@/styles/colors';

export const FORMAT_RULE_TYPE = {
    threshold: 'threshold',
    percentThreshold: 'percentThreshold',
} as const;

export const COLOR_SCHEMA = {
    Coral: ['#FFD4C8', '#CA4F28'],
    Yellow: ['#F8F6ED', '#D9AE00'],
    Green: ['#E8F9B8', '#60B731'],
    Violet: ['#E1E0FA', '#6638B6'],
    Blue: ['#E0F2FF', '#007EE5'],
} as const;

export const DEFAULT_COMPARISON_COLOR = {
    DECREASE: green[600],
    INCREASE: red[500],
} as const;

export const DATE_FORMAT = {
    'YYYY-MM-DD': {
        YEARLY: 'YYYY',
        MONTHLY: 'YYYY-MM',
        DAILY: 'YYYY-MM-DD',
    },
    'YYYY년 MM월 DD일': {
        YEARLY: 'YYYY년',
        MONTHLY: 'YYYY년 MM월',
        DAILY: 'YYYY년 MM월 DD일',
    },
    'MMM DD, YYYY': {
        YEARLY: 'YYYY',
        MONTHLY: 'MMM YYYY',
        DAILY: 'MMM DD, YYYY',
    },
    'YYYY/MM/DD': {
        YEARLY: 'YYYY',
        MONTHLY: 'YYYY/MM',
        DAILY: 'YYYY/MM/DD',
    },
    'DD/MM/YYYY': {
        YEARLY: 'YYYY',
        MONTHLY: 'MM/YYYY',
        DAILY: 'DD/MM/YYYY',
    },
    'Auto display by granularity': {
        YEARLY: 'YYYY',
        MONTHLY: 'MM',
        DAILY: 'DD',
    },
} as const;

export const NUMBER_FORMAT = {
    AUTO: 'AUTO',
    // NOTE: temporary remove short number
    // SHORT_NUMBER: 'SHORT_NUMBER',
    FULL_NUMBER: 'FULL_NUMBER',
    CUSTOM: 'CUSTOM',
} as const;

export const DATA_FIELD_HEATMAP_COLOR = {
    NONE: {
        key: 'NONE',
        label: 'None',
    },
    RED: {
        key: 'RED',
        label: 'Red',
    },
    BLUE: {
        key: 'BLUE',
        label: 'Blue',
    },
    GREEN: {
        key: 'GREEN',
        label: 'Green',
    },
    YELLOW: {
        key: 'YELLOW',
        label: 'Yellow',
    },
} as const;

export const XY_CHART_SERIES_LABEL_POSITION = {
    inside: 'inside',
    left: 'left',
    right: 'right',
    insideLeft: 'insideLeft',
    insideRight: 'insideRight',
    insideTop: 'insideTop',
    insideBottom: 'insideBottom',
} as const;

export const PIE_CHART_SERIES_LABEL_POSITION = {
    inner: 'inner',
    outer: 'outer',
} as const;

export const TABLE_DEFAULT_MINIMUM_WIDTH = 120;
