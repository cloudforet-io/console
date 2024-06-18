import { MENU_ID } from '@/lib/menu/config';

export const COST_EXPLORER_ROUTE = Object.freeze({
    _NAME: MENU_ID.COST_EXPLORER,
    COST_ANALYSIS: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}`,
        QUERY_SET: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}.query_set` },
    },
    ANOMALY_DETECTION: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.ANOMALY_DETECTION}`,
        CONFIGURATION: {
            _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.ANOMALY_DETECTION}.configuration`,
            CREATE: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.ANOMALY_DETECTION}.configuration.create` },
        },
        POLICY: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.ANOMALY_DETECTION}.policy` },
        HISTORY: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.ANOMALY_DETECTION}.history` },
    },
    BUDGET: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}`,
        DETAIL: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.detail` },
        CREATE: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.create` },
        UPDATE: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.update` },
    },
    COST_REPORT: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_REPORT}`,
    },
    DATA_SOURCES: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.DATA_SOURCES}`,
    },
    LANDING: {
        _NAME: `${MENU_ID.COST_EXPLORER}.landing`,
    },
});
