import { i18n } from '@/translations';

import getRandomId from '@/lib/random-id-generator';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

// Bookmark
export const BOOKMARK_MODAL_TYPE = {
    FOLDER: 'folder',
    LINK: 'link',
    MULTI_DELETE: 'multiDelete',
    DELETE_FOLDER: 'deleteFolder',
    DELETE_LINK: 'deleteLink',
} as const;
export const MAX_BOARD_SETS = 13;
export const MAX_BOARD_SETS_TABLET = 7;
export const DEFAULT_BOOKMARK = [
    {
        link: 'https://console.cloud.google.com/',
        name: 'GCP',
        id: `console:bookmark:undefined:GCP-${getRandomId()}`,
        imgIcon: 'https://www.gstatic.com/devrel-devsite/prod/v2a398f8757b82183cb182aec0e7c4771ac1123a40d36fc97c8783f6df9b3c672/cloud/images/favicons/onecloud/favicon.ico',
    },
    {
        link: 'https://console.aws.amazon.com/',
        name: 'AWS Console',
        id: `console:bookmark:undefined:AWS Console-${getRandomId()}`,
        imgIcon: 'https://console.aws.amazon.com/favicon.ico',
    },
    {
        link: 'https://azure.microsoft.com/',
        name: 'Azure Portal',
        id: `console:bookmark:undefined:Azure Portal-${getRandomId()}`,
        imgIcon: 'https://azure.microsoft.com/favicon.ico',
    },
];

// Configs
export const STARRED_SERVICE_ITEMS = [
    {
        icon: 'ic_service_dashboard',
        label: i18n.t('MENU.DASHBOARDS'),
        to: { name: DASHBOARDS_ROUTE._NAME },
    },
    {
        icon: 'ic_service_project',
        label: i18n.t('MENU.PROJECT'),
        to: { name: PROJECT_ROUTE._NAME },
    },
    {
        icon: 'ic_service_cloud-service',
        label: i18n.t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'),
        to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
    },
    {
        icon: 'ic_service_cost-anlaysis',
        label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'),
        to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
    },
];

// Summaries
export const WORKSPACE_HOME_DATA_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
    BILLING: 'Billing',
} as const;

export const SUMMARY_DATA_TYPE = {
    ASSET: 'Asset',
    COST: 'cost',
} as const;


