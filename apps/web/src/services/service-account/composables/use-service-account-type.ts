import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';

interface useServiceAccountTypeOptions {
    serviceAccountId: ComputedRef<string|undefined>;
}

export const useServiceAccountType = ({ serviceAccountId }: useServiceAccountTypeOptions) => {
    const serviceAccountType = computed(() => {
        if (serviceAccountId.value?.startsWith('ta')) return ACCOUNT_TYPE.TRUSTED;
        return ACCOUNT_TYPE.GENERAL;
    });

    return {
        serviceAccountType,
    };
};
