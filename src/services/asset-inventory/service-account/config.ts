export const TRUSTED_ACCOUNT_ALLOWED = ['aws'] as const;

export const ACCOUNT_TYPE = Object.freeze({
    GENERAL: 'GENERAL',
    TRUSTED: 'TRUSTED',
});

export const ACCOUNT_TYPE_BADGE_OPTION = Object.freeze({
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray200' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'blue200' },
    'TRUST-MANAGED': { label: 'Trusted Account - Managed', styleType: 'primary3' },
});
