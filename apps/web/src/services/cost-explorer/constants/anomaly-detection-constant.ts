export const ANOMALY_DETECTION_MENU = {
    ALL: 'ALL',
    THIS_MONTH: 'THIS_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    CUSTOM: 'CUSTOM',
} as const;

export const ANOMALY_DETECTION_MENU_ITEM_MAP = {
    [ANOMALY_DETECTION_MENU.ALL]: {
        name: ANOMALY_DETECTION_MENU.ALL,
    },
    [ANOMALY_DETECTION_MENU.THIS_MONTH]: {
        name: ANOMALY_DETECTION_MENU.THIS_MONTH,
        include_today: true,
    },
    [ANOMALY_DETECTION_MENU.LAST_MONTH]: {
        name: ANOMALY_DETECTION_MENU.LAST_MONTH,
        include_today: false,
    },
} as const;
