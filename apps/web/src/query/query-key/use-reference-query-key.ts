import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from './_composable/use-app-context-query-key';
import type { QueryKeyArray } from './_types/query-key-type';

export const useReferenceQueryKey = (resource: string): ComputedRef<QueryKeyArray> => {
    // Runtime validation for development environment
    if (import.meta.env.DEV) {
        if (!resource) {
            console.warn('Required parameters (service, resource, verb) must be provided');
        }
    }

    const queryKeyAppContext = useQueryKeyAppContext();

    const queryKey = computed(() => [
        ...queryKeyAppContext.value,
        resource,
    ]);
    return queryKey;
};
