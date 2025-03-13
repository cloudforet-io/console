import { computed, isRef, type Ref } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';


export const usePackageQuery = ({
    packageId, enabled,
}: {
    packageId: Ref<string|undefined>;
    enabled?: Ref<boolean>|boolean;
}) => {
    const { packageAPI, packageQueryKey } = usePackageApi();
    const queryKey = computed(() => [...packageQueryKey.value, packageId.value]);

    const { data, isLoading, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await packageAPI.get({ package_id: packageId.value as string });
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
        queryClient.setQueryData(queryKey.value, newData);
    };
    return {
        data,
        isLoading,
        refetch,
        queryKey,
        setQueryData,
    };
};
