import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_ASSET_INVENTORY_ROUTE_V1 = Object.freeze({
    _NAME: `admin.${MENU_ID.ASSET_INVENTORY}`,
    CLOUD_SERVICE: {
        _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}`,
        SEARCH: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.search` },
        TYPE_SEARCH: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.type_search` },
        NO_RESOURCE: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.no_resource` },
        DETAIL: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.CLOUD_SERVICE}.detail` },
    },
    COLLECTOR: {
        _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}`,
        CREATE: {
            _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.create`,
        },
        DETAIL: {
            _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.detail`,
        },
        HISTORY: {
            _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.history`,
            JOB: { _NAME: `${MENU_ID.ASSET_INVENTORY}.${MENU_ID.COLLECTOR}.history.job` },
        },
    },
    SERVICE_ACCOUNT: {
        _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}`,
        DETAIL: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.detail` },
        ADD: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.add` },
        NO_RESOURCE: { _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.SERVICE_ACCOUNT}.no_resource` },
    },
    METRIC_EXPLORER: {
        _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.METRIC_EXPLORER}`,
        DETAIL: {
            _NAME: `admin.${MENU_ID.ASSET_INVENTORY}.${MENU_ID.METRIC_EXPLORER}.detail`,
        },
    },
});
