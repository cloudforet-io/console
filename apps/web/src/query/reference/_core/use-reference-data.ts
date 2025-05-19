import { computed } from 'vue';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';

import type { ReferenceKeyType } from '../types/reference-type';
import { useReferenceListQuery } from './reference-list/use-reference-list-query';
import { useBatchedReferenceMap } from './reference-map/use-batched-reference-map';



interface BatchedLazyReferenceOptions {
    debounceMs?: number;
    batchSize?: number;
    maxBatchSize?: number;
  }


export const useReferenceData = <T, R extends Record<string, any>>(
    resourceKey: ReferenceKeyType,
    listFetchFn: (params: any) => Promise<ListResponse<T>>,
    transform: (item: T) => R,
    options?: BatchedLazyReferenceOptions,
) => {
    const queryKey = useReferenceQueryKey(resourceKey);

    const { referenceMap } = useBatchedReferenceMap(
        resourceKey,
        queryKey.value,
        listFetchFn,
        transform,
        options,
    );

    const { data: refererenceList, isFetching } = useReferenceListQuery(
        queryKey.value,
        listFetchFn,
        transform,
    );

    return {
        referenceMap,
        refererenceList,
        loading: computed(() => isFetching.value || refererenceList.value.length === 0),
    };
};
