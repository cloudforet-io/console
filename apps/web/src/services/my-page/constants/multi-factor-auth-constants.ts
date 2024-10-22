import { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';
import { i18n } from '@/translations';

export const MULTI_FACTOR_AUTH_ITEMS = [
    {
        type: MULTI_FACTOR_AUTH_TYPE.OTP,
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
