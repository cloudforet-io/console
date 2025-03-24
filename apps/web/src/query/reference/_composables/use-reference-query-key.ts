import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryKeyAppContext } from '@/query/_composables/use-query-key-app-context';
import type { QueryKeyArray } from '@/query/_types/query-key-type';
import { REFERENCE_TYPE_INFO_MAP } from '@/query/reference/_constants/reference-type-map-constant';

type UseReferenceQueryKeyResult = Record<keyof typeof REFERENCE_TYPE_INFO_MAP, QueryKeyArray>;

export const useReferenceQueryKey = (): ComputedRef<UseReferenceQueryKeyResult> => {
    const queryKeyAppContext = useQueryKeyAppContext('reference');

    return computed(() => Object.entries(REFERENCE_TYPE_INFO_MAP).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: [queryKeyAppContext.value, value],
    }), {} as UseReferenceQueryKeyResult));
};
