
import {
    ref,
} from 'vue';

import { useReferenceQueryKey } from '@/query/core/query-key/use-reference-query-key';
import { useBatchedReferenceFetch } from '@/query/resource-query/reference-model/composables/_internal/use-batched-reference-fetch';
import { useReferenceReactiveCache } from '@/query/resource-query/reference-model/composables/_internal/use-reference-reactive-cache';
import type { ReferenceItem } from '@/query/resource-query/reference-model/types/reference-type';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

export const useReferenceModel = <T extends Record<string, any>, R extends ReferenceItem>(
    resourceKey: ResourceKeyType,
    referenceAdaptor: (arg: T) => ReferenceItem,
    fetchOptions: { only: string[] } = { only: [] },
) => {
    const { key: queryKey } = useReferenceQueryKey(resourceKey);

    const { fetcher: enqueue } = useBatchedReferenceFetch<T>(resourceKey, queryKey, fetchOptions);

    const { referenceMapRefs } = useReferenceReactiveCache(queryKey, referenceAdaptor);

    const referenceMap = makeReferenceProxy<Record<string, R|undefined>>({}, (_, id: string) => {
        if (!(id in referenceMapRefs)) {
            enqueue(id);
            referenceMapRefs[id] = ref(undefined);
        }
        return referenceMapRefs[id].value;
    });

    return {
        referenceMap,
    };
};


// TODO: add referenceModel DX guidelines
