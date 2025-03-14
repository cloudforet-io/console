import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';

export const MULTI_FACTOR_AUTH_ITEMS = [
    {
        type: MULTI_FACTOR_AUTH_TYPE.OTP,
        icon: 'ic_microsoft_auth',
        title: 'Microsoft Authenticator App',
    },
    {
        type: MULTI_FACTOR_AUTH_TYPE.EMAIL,
        icon: 'ic_notification-protocol_envelope',
        title: 'Email',
    },
];
