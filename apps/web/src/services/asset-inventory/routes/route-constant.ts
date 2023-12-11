import { MENU_ID } from '@/lib/menu/config';

export const ASSET_INVENTORY_ROUTE = Object.freeze({
    _NAME: MENU_ID.ASSET_INVENTORY,
    CLOUD_SERVICE: {
        _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}`,
        SEARCH: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.search` },
        TYPE_SEARCH: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.type_search` },
        NO_RESOURCE: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.no_resource` },
        DETAIL: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.detail` },
    },
    SERVER: {
        _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVER}`,
    },
    COLLECTOR: {
        _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}`,
        CREATE: {
            _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.create`,
        },
        DETAIL: {
            _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.detail`,
        },
        HISTORY: {
            _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.history`,
            JOB: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.history.job` },
        },
    },
    SERVICE_ACCOUNT: {
        _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}`,
        DETAIL: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.detail` },
        SEARCH: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.search` },
        ADD: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.add` },
        NO_RESOURCE: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.no_resource` },
    },
});
