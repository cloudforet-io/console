export const ACCOUNT_TYPE = Object.freeze({
    GENERAL: 'GENERAL',
    TRUSTED: 'TRUSTED',
});

// TRUSTED-MANAGED is not added as a constant because it is used only as a style option.
export const ACCOUNT_TYPE_BADGE_OPTION = Object.freeze({
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray200' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'blue200' },
    'TRUSTED-MANAGED': { label: 'Trusted Account - Managed', styleType: 'primary3' },
});
