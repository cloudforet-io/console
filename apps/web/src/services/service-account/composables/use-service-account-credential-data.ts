import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useServiceAccountSecretQuery } from '@/services/service-account/composables/queries/use-service-account-secret-query';
import { useServiceAccountTrustedSecretQuery } from '@/services/service-account/composables/queries/use-service-account-trusted-secret-query';

interface UseServiceAccountCredentialDataOptions {
    secretId: ComputedRef<string|undefined>;
    isTrustedAccount: ComputedRef<boolean>;
}

export const useServiceAccountCredentialData = ({ secretId, isTrustedAccount }: UseServiceAccountCredentialDataOptions) => {
    const _trustedSecretId = computed(() => (isTrustedAccount.value ? secretId.value : undefined));
    const _secretId = computed(() => (isTrustedAccount.value ? undefined : secretId.value));

    const { data: secretData, isFetching: isSecretFetching } = useServiceAccountSecretQuery({
        params: computed(() => ({
            secret_id: _secretId.value ?? '',
        })),
        enabled: computed(() => !isTrustedAccount.value && !!_secretId.value),
    });

    const { data: trustedSecretData, isFetching: isTrustedSecretFetching } = useServiceAccountTrustedSecretQuery({
        params: computed(() => ({
            trusted_secret_id: _trustedSecretId.value ?? '',
        })),
        enabled: computed(() => isTrustedAccount.value && !!_trustedSecretId.value),
    });

    return {
        credentialData: computed(() => (isTrustedAccount.value ? trustedSecretData.value : secretData.value)),
        isLoading: computed(() => (isTrustedAccount.value ? isTrustedSecretFetching.value : isSecretFetching.value)),
    };
};
