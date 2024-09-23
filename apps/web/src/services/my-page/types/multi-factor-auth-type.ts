import type { RoleType } from '@/schema/identity/role/type';
import type { UserModel } from '@/schema/identity/user/model';
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

export type MultiFactorAuthModalDataType = {
    type: MultiFactorAuthType,
    state?: boolean,
    isReSync?: boolean,
};

type RoleBindingType = {
    type: RoleType;
    name: string;
};

export type UserInfoType = Partial<UserModel> & {
    role_binding?: RoleBindingType
};
