import type { UnwrapRef } from 'vue';
import { onUnmounted, ref } from 'vue';

import { hashKey } from '@tanstack/vue-query';

import { referenceQueryClient as queryClient } from '@/query/clients';
import type { QueryKeyArray } from '@/query/query-key/types/query-key-type';


export const useWatchedQueryCache = <T>(queryKey: QueryKeyArray) => {
    const data = ref<T | undefined>(queryClient.getQueryData<T>(queryKey));

    const queryKeyHash = hashKey(queryKey);

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (
            event.type === 'updated'
            && event.query.queryHash === queryKeyHash
            && event.query.state.status === 'success'
        ) {
            data.value = event.query.state.data as UnwrapRef<T>;
        }
    });

    onUnmounted(() => {
        unsubscribe();
    });

    return {
        data,
    };
};
