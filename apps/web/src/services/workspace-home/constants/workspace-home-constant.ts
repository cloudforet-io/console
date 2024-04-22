export const WORKSPACE_HOME_DATA_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
    BILLING: 'Billing',
} as const;

export const BOOKMARK_MODAL_TYPE = {
    FOLDER: 'folder',
    LINK: 'link',
    DELETE_FOLDER: 'deleteFolder',
    DELETE_LINK: 'deleteLink',
} as const;

export const SUMMARY_DATA_TYPE = {
    ASSET: 'Asset',
    COST: 'cost',
} as const;
