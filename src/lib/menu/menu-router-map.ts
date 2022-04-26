import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';
import { MenuRouter, MENU_ID } from '@/lib/menu/config';

const assetInventoryRouter = {
    [MENU_ID.ASSET_INVENTORY]: {
        name: ASSET_INVENTORY_ROUTE._NAME,
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        name: ASSET_INVENTORY_ROUTE.SERVER._NAME,
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
    },
};

const alertManagerRouter = {
    [MENU_ID.ALERT_MANAGER]: {
        name: ALERT_MANAGER_ROUTE._NAME,
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        name: ALERT_MANAGER_ROUTE.ALERT._NAME,
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
    },
};

const costExplorerRouter = {
    [MENU_ID.COST_EXPLORER]: {
        name: COST_EXPLORER_ROUTE._NAME,
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
    },
};

const projectRouter = {
    [MENU_ID.PROJECT]: {
        name: PROJECT_ROUTE._NAME,
    },

};

const administrationRouter = {
    [MENU_ID.ADMINISTRATION]: {
        name: ADMINISTRATION_ROUTE._NAME,
    },
    [MENU_ID.ADMINISTRATION_IAM]: {
        name: ADMINISTRATION_ROUTE.IAM._NAME,
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
    },
};

const myPageRouter = {
    [MENU_ID.MY_PAGE]: {
        name: MY_PAGE_ROUTE._NAME,
    },
    [MENU_ID.MY_PAGE_ACCOUNT]: {
        name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
    },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: {
        name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME,
    },
    [MENU_ID.MY_PAGE_API_KEY]: {
        name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
    },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: {
        name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
    },
};


export const menuRouterMap: MenuRouter = {
    ...assetInventoryRouter,
    ...alertManagerRouter,
    ...costExplorerRouter,
    ...projectRouter,
    ...administrationRouter,
    ...myPageRouter,
};
