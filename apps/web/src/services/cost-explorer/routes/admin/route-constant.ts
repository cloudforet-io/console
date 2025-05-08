import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_COST_EXPLORER_ROUTE = {
    _NAME: `admin.${MENU_ID.COST_EXPLORER}`,
    COST_ANALYSIS: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}`,
        QUERY_SET: { _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}.query_set` },
    },
    BUDGET: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}`,
        DETAIL: { _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.detail` },
        CREATE: { _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.create` },
        UPDATE: { _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.BUDGET}.update` },
    },
    COST_REPORT: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_REPORT}`,
    },
    DATA_SOURCES: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.DATA_SOURCES}`,
    },
    LANDING: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.landing`,
    },
    COST_ADVANCED_SETTINGS: {
        _NAME: `admin.${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ADVANCED_SETTINGS}`,
    },
} as const;
