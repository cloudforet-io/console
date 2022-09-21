export const TRUSTED_ACCOUNT_ALLOWED = ['aws'] as const;

export const ACCOUNT_TYPE = Object.freeze({
    GENERAL: 'GENERAL',
    TRUSTED: 'TRUSTED',
});

export const ACCOUNT_TYPE_BADGE_OPTION = Object.freeze({
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'primary' },
});
