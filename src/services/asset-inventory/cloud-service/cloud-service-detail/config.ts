export const CLOUD_SERVICE_TAG_TYPE = Object.freeze({
    CUSTOM: 'CUSTOM',
    MANAGED: 'MANAGED',
});

export const CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION = Object.freeze({
    // song-lang : label
    [CLOUD_SERVICE_TAG_TYPE.CUSTOM]: { label: 'Custom', styleType: 'primary1' },
    [CLOUD_SERVICE_TAG_TYPE.MANAGED]: { label: 'Managed', styleType: 'gray' },
});
