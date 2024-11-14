import { MENU_ID } from '@/lib/menu/config';

export const ITSM_ROUTE = Object.freeze({
    _NAME: MENU_ID.ITSM,
    ITSM_LANDING: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.ITSM_LANDING}` },
    BOARD: {
        _NAME: `${MENU_ID.ITSM}.${MENU_ID.BOARD}`,
        TASK_DETAIL: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.BOARD}.task_detail` },
        TASK_CREATE: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.BOARD}.task_create` },
    },
    WORKFLOW: {
        _NAME: `${MENU_ID.ITSM}.${MENU_ID.WORKFLOW}`,
        DETAIL: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.WORKFLOW}.detail` },
    },
    TASK_MANAGEMENT: {
        _NAME: `${MENU_ID.ITSM}.${MENU_ID.TASK_MANAGEMENT}`,
        TASK_CATEGORY: {
            _NAME: `${MENU_ID.ITSM}.${MENU_ID.TASK_MANAGEMENT}.task_category`,
            DETAIL: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.TASK_MANAGEMENT}.task_category.detail` },
            CREATE: { _NAME: `${MENU_ID.ITSM}.${MENU_ID.TASK_MANAGEMENT}.task_category.create` },
        },
    },
});
