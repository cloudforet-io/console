import { computed, ref } from 'vue';

import { useQuery } from '@tanstack/vue-query';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';


export const useReferenceListQuery = <T, R extends Record<string, any>>(
    queryKey: QueryKeyArray,
    listFetchFn: (params: any) => Promise<ListResponse<T>>,
    transform: (item: T) => R,
) => {
    const hasTrriggered = ref(false);

    const {
        data, isFetched, isFetching, refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await listFetchFn({});
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
