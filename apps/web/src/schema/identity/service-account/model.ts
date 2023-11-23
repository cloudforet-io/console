import type { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';

export interface ServiceAccountModel {
    name: string;
    provider: string;
    service_account_id: string;
    service_account_type?: AccountType;
    data: {
        [key: string]: string;
    },
    tags: { [key: string]: unknown; };
}

export interface ServiceAccountModelForBinding extends Omit<ServiceAccountModel, 'service_account_type'> {
    service_account_type?: AccountType | 'TRUSTED-MANAGED';
}

export type AccountType = typeof ACCOUNT_TYPE[keyof typeof ACCOUNT_TYPE];
