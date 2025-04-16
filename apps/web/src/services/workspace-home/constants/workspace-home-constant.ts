import { i18n } from '@/translations';

import * as styles from '@/styles/colors';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import type { StarredServiceItem } from '@/services/workspace-home/types/workspace-home-type';

// Bookmark
export const MAX_BOARD_SETS = 13;
export const MAX_BOARD_SETS_TABLET = 7;
export const BOOKMARK_TYPE = {
    ADMIN: 'admin',
    WORKSPACE: 'workspace',
    USER: 'user',
} as const;

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
        to: PROJECT_ROUTE_V2._NAME,
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
    {
        icon: 'ic_service_alert',
        label: i18n.t('MENU.ALERT_MANAGER_SERVICE'),
        to: ALERT_MANAGER_ROUTE.SERVICE._NAME,
    },
];

// Summaries
export const WORKSPACE_HOME_DATA_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
    BILLING: 'Billing',
} as const;

export const SERVICE_ACCOUNT_SUMMARY_STATE_COLOR = {
    ACTIVE: {
        iconColor: styles.green[600],
        textColor: styles.gray[700],
    },
    DELETED: {
        iconColor: styles.red[500],
        textColor: styles.gray[700],
    },
    PENDING: {
        iconColor: styles.yellow[500],
        textColor: styles.gray[700],
    },
    INACTIVE: {
        iconColor: styles.gray[400],
        textColor: styles.gray[700],
    },
} as const;
export const COST_SUMMARY_STATE_COLOR = {
    AGGREGATING: {
        iconColor: styles.blue[500],
        textColor: styles.gray[700],
    },
    CONFIRM: {
        iconColor: styles.green[700],
        textColor: styles.gray[700],
    },
    ESTIMATED: {
        iconColor: styles.coral[400],
        textColor: styles.gray[700],
    },
} as const;


