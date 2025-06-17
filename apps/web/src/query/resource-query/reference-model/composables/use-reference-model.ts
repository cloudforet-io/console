
import type { Ref } from 'vue';
import {
    reactive, ref, watch,
} from 'vue';

import { useReferenceQueryKey } from '@/query/core/query-key/use-reference-query-key';
import { useBatchedReferenceFetch } from '@/query/resource-query/reference-model/composables/_internal/use-batched-reference-fetch';
import type { ReferenceItem } from '@/query/resource-query/reference-model/types/reference-type';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';
import { useWatchedQueryCache } from '@/query/shared/use-watched-query-cache';

export const useReferenceModel = <T extends Record<string, any>, R extends ReferenceItem>(
    resourceKey: ResourceKeyType,
    referenceAdaptor: (arg: T) => ReferenceItem,
    fetchOptions: { only: string[] } = { only: [] },
) => {
    const { key: queryKey } = useReferenceQueryKey(resourceKey);

    // Core
    const { fetcher: enqueue } = useBatchedReferenceFetch<T>(
        resourceKey,
        queryKey.value,
        fetchOptions,
    );

    const cachedReactiveMap = reactive<Record<string, Ref<R|undefined>>>({});

    const referenceMap = makeReferenceProxy<Record<string, R|undefined>>({}, (_, id: string) => {
        if (!(id in cachedReactiveMap)) {
            enqueue(id);
            cachedReactiveMap[id] = ref(undefined);
        }
        return cachedReactiveMap[id].value;
    });

    // Watch cache for updates
    const { data: cachedData } = useWatchedQueryCache<Record<string, T>>(queryKey.value);
    watch(cachedData, (data) => {
        if (data) {
            Object.entries(data).forEach(([id, item]) => {
                const referenceData = referenceAdaptor(item) as R;
                if (!cachedReactiveMap[id]) cachedReactiveMap[id] = ref(referenceData) as Ref<R|undefined>;
                else cachedReactiveMap[id].value = referenceData;
            });
        }
    }, { immediate: true });

    return {
        referenceMap,
    };
};


// TODO: add referenceModel DX guidelines
