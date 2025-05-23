import { computed, ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';


export const useReferenceListQuery = <T, R extends Record<string, any>>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
    transform: (item: T) => R,
) => {
    const { listFetchFn } = fetchInfo;
    const { key: queryKey } = useReferenceQueryKey(resourceKey);
    const hasTrriggered = ref(false);

    const {
        data, isFetched, isFetching, refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await listFetchFn({
                query: {
                    only: fetchInfo.only,
                },
            });
            return response.results || [];
        },
        select: (item) => item.map(transform),
        enabled: computed(() => hasTrriggered.value),
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    return {
        data: computed<R[]>(() => {
            if (!hasTrriggered.value && !isFetched.value && !data.value) {
                refetch();
                hasTrriggered.value = true;
            }
            return data.value || [];
        }),
        isFetching,
    };
};
