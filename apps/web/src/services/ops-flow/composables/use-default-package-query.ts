import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

import { usePackageApi } from '@/api-clients/identity/package/composables/use-package-api';
import type { PackageListParameters } from '@/api-clients/identity/package/schema/api-verbs/list';


export const useDefaultPackageQuery = () => {
    const { packageAPI, packageListQueryKey } = usePackageApi();

    const defaultPackageQuery: PackageListParameters = {
        query: {
            filter: [{ k: 'is_default', v: true, o: 'eq' }],
        },
    };
    const { data: defaultPackage, isLoading } = useQuery({
        queryKey: computed<[QueryKey, PackageListParameters]>(() => [
            packageListQueryKey.value,
            defaultPackageQuery,
        ]),
        queryFn: async ({ queryKey }) => {
            const { results } = await packageAPI.list(queryKey[1]);
            return results?.[0];
        },
        staleTime: 1000 * 60 * 5, // 5minutes
        gcTime: 1000 * 60, // 1minute
    });

    return {
        defaultPackage,
        isLoading,
    };
};
