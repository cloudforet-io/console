import {
    blue, coral, green, indigo, peacock, violet, yellow,
} from '@/styles/colors';

export const MONITORING_TYPE = {
    METRIC: 'METRIC',
    LOG: 'LOG',
} as const;
export type MonitoringType = typeof MONITORING_TYPE[keyof typeof MONITORING_TYPE];

export const STATISTICS_TYPE = {
    AVERAGE: 'AVERAGE',
    MAXIMUM: 'MAXIMUM',
    MINIMUM: 'MINIMUM',
} as const;
export type StatisticsType = typeof STATISTICS_TYPE[keyof typeof STATISTICS_TYPE];

export const COLORS = [
    coral[500], blue[500], violet[500], yellow[500], green[400], coral[400], peacock[500], coral[600],
    peacock[400], green[600], green[500], blue[400], indigo[500], violet[400], indigo[400], blue[600],
];

export const TIME_RANGE = Object.freeze({
    '1h': 1,
    '3h': 3,
    '6h': 6,
    '12h': 12,
    '1d': 24,
    '3d': 24 * 3,
    '1w': 24 * 7,
    '2w': 24 * 14,
} as const);
