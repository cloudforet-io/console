import { toValue, type MaybeRef } from '@vueuse/core';
import { computed } from 'vue';

import { useQuery, type UseQueryOptions } from '@tanstack/vue-query';

import type { APIError } from '@cloudforet/core-lib/space-connector/error';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import { useAppContextStore } from '@/store/app-context/app-context-store';


const REFERENCE_LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours

export const useReferenceQuery = <TQueryFnData extends ListResponse<unknown>, TError = unknown, TData = TQueryFnData>(
    options: UseQueryOptions<TQueryFnData, TError, TData>,
) => {
    const appContextStore = useAppContextStore();

    const queryEnabled = computed<boolean>(() => {
        const _inheritedEnabled = ('enabled' in options ? options.enabled : undefined) as MaybeRef<boolean> | undefined;
        if (_inheritedEnabled !== undefined && !toValue(_inheritedEnabled)) return false;
        return !appContextStore.getters.globalGrantLoading;
    });

    return useQuery<TQueryFnData, TError, TData>({
        ...options,
        enabled: queryEnabled,
        staleTime: REFERENCE_LOAD_TTL,
        retry: (failureCount, err) => {
            if ((err as APIError).status === 404) {
                return false;
            }
            return failureCount < 3;
        },
        // TODO: add error handler
    });
};
