export const TRUST_ACCOUNT_ALLOWED = ['aws'] as const;

export const ACCOUNT_TYPE = Object.freeze({
    GENERAL: 'GENERAL',
    TRUST: 'TRUST',
});

export const ACCOUNT_TYPE_BADGE_OPTION = Object.freeze({
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray' },
    [ACCOUNT_TYPE.TRUST]: { label: 'Trust Account', styleType: 'primary' },
});
