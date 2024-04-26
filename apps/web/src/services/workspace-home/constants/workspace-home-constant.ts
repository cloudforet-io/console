import getRandomId from '@/lib/random-id-generator';

// Bookmark
export const BOOKMARK_MODAL_TYPE = {
    FOLDER: 'folder',
    LINK: 'link',
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


