import { computed, isRef, type Ref } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


export const usePackageQuery = ({
    packageId, enabled,
}: {
    packageId: Ref<string|undefined>;
    enabled?: Ref<boolean>|boolean;
}) => {
    const { packageAPI } = usePackageApi();
    const { key: packageQueryKey, params: packageParams } = useServiceQueryKey('identity', 'package', 'get', {
        contextKey: packageId,
        params: computed(() => ({ package_id: packageId.value as string })),
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: packageQueryKey,
        queryFn: async () => {
            const res = await packageAPI.get(packageParams.value);
            return res;
        },
        enabled: computed(() => {
            if (isRef(enabled)) return enabled.value && !!packageId.value;
            if (typeof enabled === 'boolean') return enabled && !!packageId.value;
            return !!packageId.value;
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    const queryClient = useQueryClient();
    const setQueryData = (newData: PackageModel) => {
        queryClient.setQueryData(packageQueryKey.value, newData);
    };
    return {
        data,
        isLoading,
        refetch,
        queryKey: packageQueryKey,
        setQueryData,
    };
};
