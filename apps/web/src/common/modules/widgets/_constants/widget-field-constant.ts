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
} as const;
