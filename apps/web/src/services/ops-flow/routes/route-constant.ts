import { MENU_ID } from '@/lib/menu/config';

export const OPS_FLOW_ROUTE = Object.freeze({
    _NAME: MENU_ID.OPS_FLOW,
    LANDING: { _NAME: `${MENU_ID.OPS_FLOW}.${MENU_ID.OPS_FLOW_LANDING}` },
    BOARD: {
        _NAME: `${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_BOARD}`,
        TASK_DETAIL: { _NAME: `${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_BOARD}.task_detail` },
        TASK_CREATE: { _NAME: `${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_BOARD}.task_create` },
    },
});
