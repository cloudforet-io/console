import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { AccountModel, ServiceAccountModelForBinding } from '@/schema/identity/service-account/type';


const isManagedTrustedAccount = (account:AccountModel):boolean => {
    if ('permission_group' in account) return !!(account.trusted_account_id) && (account?.permission_group === 'DOMAIN');
    return false;
};

interface ServiceAccountPreprocesseor {
    (serviceAccount: AccountModel): ServiceAccountModelForBinding;
    (serviceAccount: AccountModel[]): ServiceAccountModelForBinding[];
}

export const serviceAccountPreprocessor: ServiceAccountPreprocesseor = (serviceAccount) => {
    if (Array.isArray(serviceAccount)) {
        return serviceAccount.map((account) => ({
            ...account,
            service_account_type: isManagedTrustedAccount(account) ? 'TRUSTED-MANAGED' : ACCOUNT_TYPE.TRUSTED,
        }));
    }
    return {
        ...serviceAccount,
        service_account_type: isManagedTrustedAccount(serviceAccount) ? 'TRUSTED-MANAGED' : ACCOUNT_TYPE.TRUSTED,
    };
};
