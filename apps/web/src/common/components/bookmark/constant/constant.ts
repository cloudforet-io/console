export const BOOKMARK_MODAL_TYPE = {
    FOLDER: 'folder',
    LINK: 'link',
    MULTI_DELETE: 'multiDelete',
    DELETE_FOLDER: 'deleteFolder',
    DELETE_LINK: 'deleteLink',
} as const;


export const DEFAULT_BOOKMARK = [
    {
        link: 'https://console.cloud.google.com/',
        name: 'GCP',
        imgIcon: 'https://www.gstatic.com/devrel-devsite/prod/v2a398f8757b82183cb182aec0e7c4771ac1123a40d36fc97c8783f6df9b3c672/cloud/images/favicons/onecloud/favicon.ico',
    },
    {
        link: 'https://console.aws.amazon.com/',
        name: 'AWS Console',
    },
    {
        link: 'https://azure.microsoft.com/',
        name: 'Azure Portal',
    },
];
