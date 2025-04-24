import { computed, type Ref } from 'vue';

import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


export const usePackagesQuery = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const { packageAPI } = usePackageApi();

    const { key: packageListQueryKey, params: packageListParams } = useServiceQueryKey('identity', 'package', 'list', {
        params: computed(() => ({})),
    });

    const { data: packages, isLoading, refetch } = useQuery({
        queryKey: packageListQueryKey,
        queryFn: async () => {
            const { results } = await packageAPI.list(packageListParams.value);
            return results as PackageModel[]|undefined;
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });

    const queryClient = useQueryClient();
    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: packageListQueryKey.value });
    };
    return {
        packages,
        isLoading,
        refetch,
        queryKey: packageListQueryKey,
        invalidateQueries,
    };
};
