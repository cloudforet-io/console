import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

const assetInventoryRouter = {
    asset_inventory: {
        name: ASSET_INVENTORY_ROUTE._NAME,
    },
    'asset_inventory.cloud_service': {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
    },
    'asset_inventory.server': {
        name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
    },
    'asset_inventory.collector': {
        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
    },
    'asset_inventory.service_account': {
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
    },
};

const alertManagerRouter = {
    alert_manager: {
        name: ALERT_MANAGER_ROUTE._NAME,
    },
    'alert_manager.dashboard': {
        name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
    },
    'alert_manager.alert': {
        name: ALERT_MANAGER_ROUTE.ALERT._NAME,
    },
    'alert_manager.escalation_policy': {
        name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
    },
};

const costExplorerRouter = {
    cost_explorer: {
        name: COST_EXPLORER_ROUTE._NAME,
    },
    'cost_explorer.dashboard': {
        name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
    },
    'cost_explorer.cost_analysis': {
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
    },
    'cost_explorer.budget': {
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
    },
};

const projectRouter = {
    project: {
        name: PROJECT_ROUTE._NAME,
    },

};

const administrationRouter = {
    administration: {
        name: ADMINISTRATION_ROUTE._NAME,
    },
    'administration.iam': {
        name: ADMINISTRATION_ROUTE.IAM._NAME,
    },
    'administration.user': {
        name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
    },
};

const myPageRouter = {
    my_page: {
        name: MY_PAGE_ROUTE._NAME,
    },
    'my_page.account_profile': {
        name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
    },
    'my_page.api_key': {
        name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
    },
    'my_page.notifications': {
        name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
    },
};


export const menuRouterMap = {
    ...assetInventoryRouter,
    ...alertManagerRouter,
    ...costExplorerRouter,
    ...projectRouter,
    ...administrationRouter,
    ...myPageRouter,
};
