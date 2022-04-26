import { MENU_ID } from '@/lib/menu/config';

export const MY_PAGE_ROUTE = Object.freeze({
    _NAME: MENU_ID.MY_PAGE,
    MY_ACCOUNT: {
        _NAME: MENU_ID.MY_PAGE_ACCOUNT,
        ACCOUNT: { _NAME: MENU_ID.MY_PAGE_ACCOUNT_PROFILE },
        API_KEY: { _NAME: MENU_ID.MY_PAGE_API_KEY },
        NOTIFICATION: {
            _NAME: MENU_ID.MY_PAGE_NOTIFICATIONS,
            ADD: { _NAME: 'addNotification' },
            MANAGE: { _NAME: 'manageNotification' },
        },
    },
});
