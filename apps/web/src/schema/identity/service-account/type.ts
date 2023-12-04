import type { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

export type AccountType = typeof ACCOUNT_TYPE[keyof typeof ACCOUNT_TYPE];

export type AccountModel = ServiceAccountModel | TrustedAccountModel;

export type ServiceAccountModelForBinding = AccountModel & {
    service_account_type?: AccountType | 'TRUSTED-MANAGED' | undefined;
};
