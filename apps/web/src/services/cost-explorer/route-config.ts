import { MENU_ID } from '@/lib/menu/config';

export const COST_EXPLORER_ROUTE = Object.freeze({
    _NAME: MENU_ID.COST_EXPLORER,
    COST_ANALYSIS: {
        _NAME: MENU_ID.COST_EXPLORER_COST_ANALYSIS,
        QUERY_SET: { _NAME: `${MENU_ID.COST_EXPLORER_COST_ANALYSIS}.query_set` },
    },
    BUDGET: {
        _NAME: MENU_ID.COST_EXPLORER_BUDGET,
        DETAIL: { _NAME: `${MENU_ID.COST_EXPLORER_BUDGET}.detail` },
        CREATE: { _NAME: `${MENU_ID.COST_EXPLORER_BUDGET}.create` },
        BULK_CREATE: { _NAME: `${MENU_ID.COST_EXPLORER_BUDGET}.bulk_create` },
        UPDATE: { _NAME: `${MENU_ID.COST_EXPLORER_BUDGET}.update` },
    },
});
