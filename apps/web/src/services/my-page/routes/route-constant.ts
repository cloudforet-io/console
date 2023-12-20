import { MENU_ID } from '@/lib/menu/config';

export const MY_PAGE_ROUTE = Object.freeze({
    _NAME: MENU_ID.MY_PAGE,
    MY_ACCOUNT: {
        _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.ACCOUNT}`,
        ACCOUNT_PROFILE: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.ACCOUNT}.${MENU_ID.ACCOUNT_PROFILE}` },
        NOTIFICATION: {
            _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.ACCOUNT}.${MENU_ID.NOTIFICATIONS}`,
            ADD: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.ACCOUNT}.${MENU_ID.NOTIFICATIONS}.add` },
            MANAGE: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.ACCOUNT}.${MENU_ID.NOTIFICATIONS}.manage` },
        },
    },
    INFO: {
        _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.INFO}`,
        NOTICE: {
            _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.INFO}.${MENU_ID.NOTICE}`,
            CREATE: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.INFO}.${MENU_ID.NOTICE}.create` },
            UPDATE: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.INFO}.${MENU_ID.NOTICE}.update` },
            DETAIL: { _NAME: `${MENU_ID.MY_PAGE}.${MENU_ID.INFO}.${MENU_ID.NOTICE}.detail` },
        },
    },
});
