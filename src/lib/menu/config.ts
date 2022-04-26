export const MENU_ID = Object.freeze({
    PROJECT: 'project',
    ASSET_INVENTORY: 'asset_inventory',
    ASSET_INVENTORY_CLOUD_SERVICE: 'asset_inventory.cloud_service',
    ASSET_INVENTORY_SERVER: 'asset_inventory.server',
    ASSET_INVENTORY_COLLECTOR: 'asset_inventory.collector',
    ASSET_INVENTORY_SERVICE_ACCOUNT: 'asset_inventory.service_account',
    COST_EXPLORER: 'cost_explorer',
    COST_EXPLORER_DASHBOARD: 'cost_explorer.dashboard',
    COST_EXPLORER_COST_ANALYSIS: 'cost_explorer.cost_analysis',
    COST_EXPLORER_BUDGET: 'cost_explorer.budget',
    ALERT_MANAGER: 'alert_manager',
    ALERT_MANAGER_DASHBOARD: 'alert_manager.dashboard',
    ALERT_MANAGER_ALERT: 'alert_manager.alert',
    ALERT_MANAGER_ESCALATION_POLICY: 'alert_manager.escalation_policy',
    ADMINISTRATION: 'administration',
    ADMINISTRATION_IAM: 'administration.iam',
    ADMINISTRATION_USER: 'administration.user',
    MY_PAGE: 'my_page',
    MY_PAGE_ACCOUNT: 'my_page.account',
    MY_PAGE_ACCOUNT_PROFILE: 'my_page.account_profile',
    MY_PAGE_API_KEY: 'my_page.api_key',
    MY_PAGE_NOTIFICATIONS: 'my_page.notifications',
} as const);

export const MENU_LIST: Menu[] = [
    { id: MENU_ID.PROJECT },
    {
        id: MENU_ID.ASSET_INVENTORY,
        subMenuList: [
            { id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE },
            { id: MENU_ID.ASSET_INVENTORY_SERVER },
            { id: MENU_ID.ASSET_INVENTORY_COLLECTOR },
            { id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_EXPLORER_DASHBOARD },
            { id: MENU_ID.COST_EXPLORER_COST_ANALYSIS },
            { id: MENU_ID.COST_EXPLORER_BUDGET },
        ],
    },
    {
        id: MENU_ID.ALERT_MANAGER,
        subMenuList: [
            { id: MENU_ID.ALERT_MANAGER_DASHBOARD },
            { id: MENU_ID.ALERT_MANAGER_ALERT },
            { id: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY },
        ],
    },
    {
        id: MENU_ID.ADMINISTRATION,
        subMenuList: [
            {
                id: MENU_ID.ADMINISTRATION_IAM,
                subMenuList: [
                    { id: MENU_ID.ADMINISTRATION_USER },
                ],
            },
        ],
    },
    {
        id: MENU_ID.MY_PAGE,
        optional: true,
        subMenuList: [
            {
                id: MENU_ID.MY_PAGE_ACCOUNT,
                subMenuList: [
                    { id: MENU_ID.MY_PAGE_ACCOUNT_PROFILE },
                    { id: MENU_ID.MY_PAGE_API_KEY },
                    { id: MENU_ID.MY_PAGE_NOTIFICATIONS },
                ],
            },

        ],
    },
];


export const MENU_INFO = Object.freeze({
    [MENU_ID.PROJECT]: { label: 'Project', translationId: '', icon: 'ic_project' },
    [MENU_ID.ASSET_INVENTORY]: { label: 'Asset Inventory', translationId: '', icon: 'ic_inventory' },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: { label: 'Cloud Service', translationId: '' },
    [MENU_ID.ASSET_INVENTORY_SERVER]: { label: 'Server', translationId: '' },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: { label: 'Collector', translationId: '' },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: { label: 'Service Account', translationId: '' },
    [MENU_ID.COST_EXPLORER]: { label: 'Cost Explorer', translationId: '', icon: 'ic_analytics' },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: { label: 'Dashboard', translationId: '' },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: { label: 'Cost Analysis', translationId: '' },
    [MENU_ID.COST_EXPLORER_BUDGET]: { label: 'Budget', translationId: '' },
    [MENU_ID.ALERT_MANAGER]: { label: 'Alert Manager', translationId: '', icon: 'ic_monitoring' },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: { label: 'Dashboard', translationId: '' },
    [MENU_ID.ALERT_MANAGER_ALERT]: { label: 'Alert', translationId: '' },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: { label: 'Escalation Policy', translationId: '' },
    [MENU_ID.ADMINISTRATION]: { label: 'Administration', translationId: '', icon: 'ic_management' },
    [MENU_ID.ADMINISTRATION_IAM]: { label: 'IAM', translationId: '' },
    [MENU_ID.ADMINISTRATION_USER]: { label: 'User', translationId: '' },
    [MENU_ID.MY_PAGE]: { label: 'My Page', translationId: '', icon: 'ic_identity' },
    [MENU_ID.MY_PAGE_ACCOUNT]: { label: 'My Account', translationId: '' },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: { label: 'Account & Profile', translationId: '' },
    [MENU_ID.MY_PAGE_API_KEY]: { label: 'Access with API & CLI', translationId: '' },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: { label: 'Notifications Channel', translationId: '' },
} as const);

export interface Menu {
    id: string;
    subMenuList?: Menu[];
    optional?: boolean;
    isNew?: boolean;
    isBeta?: boolean;
}

export type MenuIdType = typeof MENU_ID[keyof typeof MENU_ID];

interface RouteName {
    name: string;
}

export type MenuRouter = Record<MenuIdType, RouteName>
