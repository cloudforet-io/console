import { i18n } from '@/translations';

export const MULTI_FACTOR_AUTH_TYPE = {
    MS: 'MICROSOFT_AUTHENTICATOR_APP',
    EMAIL: 'EMAIL',
} as const;

export type MultiFactorAuthType = typeof MULTI_FACTOR_AUTH_TYPE[keyof typeof MULTI_FACTOR_AUTH_TYPE];

export const MULTI_FACTOR_AUTH_ITEMS = [
    {
        type: MULTI_FACTOR_AUTH_TYPE.MS,
        icon: 'ic_microsoft_auth',
        title: 'Microsoft Authenticator App',
        desc: i18n.t('MY_PAGE.MFA.MS_DESC'),
    },
    {
        type: MULTI_FACTOR_AUTH_TYPE.EMAIL,
        icon: 'ic_notification-protocol_envelope',
        title: 'Email',
        desc: i18n.t('MY_PAGE.MFA.EMAIL_DESC'),
    },
];

export const MULTI_FACTOR_AUTH_MODAL_TYPE = {
    MS: MULTI_FACTOR_AUTH_TYPE.MS,
    EMAIL: MULTI_FACTOR_AUTH_TYPE.EMAIL,
    DISABLED: 'disabled',
} as const;

export type MultiFactorAuthModalType = typeof MULTI_FACTOR_AUTH_MODAL_TYPE[keyof typeof MULTI_FACTOR_AUTH_MODAL_TYPE];
