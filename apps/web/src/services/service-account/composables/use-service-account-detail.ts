import type { ComputedRef } from 'vue';
import { computed } from 'vue';


import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';

import { useServiceAccountQuery } from '@/services/service-account/composables/queries/use-service-account-query';
import { useTrustedAccountQuery } from '@/services/service-account/composables/queries/use-trusted-account-query';
import { useServiceAccountType } from '@/services/service-account/composables/use-service-account-type';

interface useServiceAccountDetailOptions {
    serviceAccountId: ComputedRef<string|undefined>;
}

export const useServiceAccountDetail = ({ serviceAccountId }: useServiceAccountDetailOptions) => {
    const { serviceAccountType } = useServiceAccountType({
        serviceAccountId: computed(() => serviceAccountId.value),
    });
    const isTrustedAccount = computed(() => serviceAccountType.value === ACCOUNT_TYPE.TRUSTED);

    const {
        data: serviceAccountData,
        isFetching: isServiceAccountFetching,
        refetch: refetchServiceAccount,
    } = useServiceAccountQuery({
        serviceAccountId: computed(() => serviceAccountId.value),
        enabled: computed(() => !isTrustedAccount.value && !!serviceAccountId.value),
    });
    const {
        data: trustedAccountData,
        isFetching: isTrustedAccountFetching,
        refetch: refetchTrustedAccount,
    } = useTrustedAccountQuery({
        trustedAccountId: computed(() => serviceAccountId.value),
        enabled: computed(() => isTrustedAccount.value && !!serviceAccountId.value),
    });

    const refetch = async () => {
        if (isTrustedAccount.value) {
            await refetchTrustedAccount();
        } else {
            await refetchServiceAccount();
        }
    };

    return {
        isTrustedAccount,
        serviceAccountData: computed(() => (isTrustedAccount.value ? trustedAccountData.value : serviceAccountData.value)),
        isLoading: computed(() => (isTrustedAccount.value ? isTrustedAccountFetching.value : isServiceAccountFetching.value)),
        refetch,
    };
};
