import type { Ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageModel } from '@/api-clients/identity/package/schema/model';


export const usePackagesQuery = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const { packageAPI, packageListQueryKey } = usePackageApi();
    const { data: packages, isLoading, refetch } = useQuery({
        queryKey: packageListQueryKey,
        queryFn: async () => {
            const { results } = await packageAPI.list({});
            return results as PackageModel[]|undefined;
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60, // 1 minute
    });
    return {
        packages,
        isLoading,
        refetch,
    };
};
