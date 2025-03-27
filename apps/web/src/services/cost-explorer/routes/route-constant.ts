import { MENU_ID } from '@/lib/menu/config';

export const COST_EXPLORER_ROUTE = {
    _NAME: MENU_ID.COST_EXPLORER,
    COST_ANALYSIS: {
        _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}`,
        QUERY_SET: { _NAME: `${MENU_ID.COST_EXPLORER}.${MENU_ID.COST_ANALYSIS}.query_set` },
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
    LANDING: {
        _NAME: `${MENU_ID.COST_EXPLORER}.landing`,
    },
} as const;
