import { MENU_ID } from '@/lib/menu/config';

export const SERVICE_ACCOUNT_ROUTE = Object.freeze({
    _NAME: MENU_ID.SERVICE_ACCOUNT,
    DETAIL: { _NAME: `${MENU_ID.SERVICE_ACCOUNT}.detail` },
    ADD: { _NAME: `${MENU_ID.SERVICE_ACCOUNT}.add` },
    NO_RESOURCE: { _NAME: `${MENU_ID.SERVICE_ACCOUNT}.no_resource` },
});
