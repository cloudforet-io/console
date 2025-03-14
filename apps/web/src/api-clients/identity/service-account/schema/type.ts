import type { ACCOUNT_TYPE, SERVICE_ACCOUNT_STATE } from '@/api-clients/identity/service-account/schema/constant';

export type AccountType = typeof ACCOUNT_TYPE[keyof typeof ACCOUNT_TYPE];
export type ServiceAccountType = typeof SERVICE_ACCOUNT_STATE[keyof typeof SERVICE_ACCOUNT_STATE];
export type ServiceAccountAssetInfoType = {
    server_count: number,
    database_count: number,
    storage_size: number,
};
export type ServiceAccountCostInfoType = {
    month: number,
    day: number
};
