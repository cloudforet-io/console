import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_SERVICE_ACCOUNT_ROUTE = Object.freeze({
    _NAME: `admin.${MENU_ID.SERVICE_ACCOUNT}`,
    DETAIL: { _NAME: `admin.${MENU_ID.SERVICE_ACCOUNT}.detail` },
    ADD: { _NAME: `admin.${MENU_ID.SERVICE_ACCOUNT}.add` },
    NO_RESOURCE: { _NAME: `admin.${MENU_ID.SERVICE_ACCOUNT}.no_resource` },
});
