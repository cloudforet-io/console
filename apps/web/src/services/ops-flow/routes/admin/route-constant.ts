import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_OPS_FLOW_ROUTE = Object.freeze({
    _NAME: `admin.${MENU_ID.OPS_FLOW}`,
    TASK_MANAGEMENT: {
        _NAME: `admin.${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_MANAGEMENT}`,
        TASK_CATEGORY: {
            DETAIL: {
                _NAME: `admin.${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_MANAGEMENT}.task_category.detail`,
                STATUS: { _NAME: `admin.${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_MANAGEMENT}.task_category.detail.status` },
                TASK_TYPE: { _NAME: `admin.${MENU_ID.OPS_FLOW}.${MENU_ID.TASK_MANAGEMENT}.task_category.detail.task_type` },
            },
        },
    },
});
