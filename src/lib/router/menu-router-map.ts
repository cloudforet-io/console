import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

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
    'asset_inventory.collector_history': {
        name: ASSET_INVENTORY_ROUTE.COLLECTOR_HISTORY._NAME,
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

const administrationMenuRouter = {
    administration: {
        name: ADMINISTRATION_ROUTE._NAME,
    },
    'administration.iam': {
        name: ADMINISTRATION_ROUTE.IAM._NAME,
    },
};


export const menuRouterMap = {
    ...assetInventoryRouter,
    ...alertManagerRouter,
    ...costExplorerRouter,
    ...projectRouter,
    ...administrationMenuRouter,
};
