import { i18n } from '@/translations';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { StarredServiceItem } from '@/services/workspace-home/types/workspace-home-type';

// Bookmark
export const MAX_BOARD_SETS = 13;
export const MAX_BOARD_SETS_TABLET = 7;

// Configs
export const STARRED_SERVICE_ITEMS: StarredServiceItem[] = [
    {
        icon: 'ic_service_dashboard',
        label: i18n.t('MENU.DASHBOARDS'),
        to: DASHBOARDS_ROUTE._NAME,
    },
    {
        icon: 'ic_service_project',
        label: i18n.t('MENU.PROJECT'),
        to: PROJECT_ROUTE._NAME,
    },
    {
        icon: 'ic_service_cloud-service',
        label: i18n.t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'),
        to: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
    },
    {
        icon: 'ic_service_cost-analysis',
        label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'),
        to: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
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


