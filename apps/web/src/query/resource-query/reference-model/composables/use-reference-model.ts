
import type { Ref } from 'vue';
import {
    reactive, ref, watch,
} from 'vue';

import { useWatchedQueryCache } from '@/query/composables/use-watched-query-cache';
import { useReferenceQueryKey } from '@/query/query-key/use-reference-query-key';
import { useBatchedReferenceFetch } from '@/query/resource-query/reference-model/composables/_internal/use-batched-reference-fetch';
import type { ReferenceConfig, ReferenceItem } from '@/query/resource-query/reference-model/types/reference-type';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';

export const useReferenceModel = <T extends Record<string, any>, R extends ReferenceItem>(
    resourceKey: ResourceKeyType,
    referenceConfig: ReferenceConfig<T>,
) => {
    const { key: queryKey } = useReferenceQueryKey(resourceKey);
    const { transform } = referenceConfig;

    // Core
    const { fetcher: enqueue } = useBatchedReferenceFetch<T>(
        resourceKey,
        queryKey.value,
        referenceConfig,
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
                const transformed = transform(item) as R;
                if (!cachedReactiveMap[id]) cachedReactiveMap[id] = ref(transformed) as unknown as Ref<R|undefined>;
                else cachedReactiveMap[id].value = transformed;
            });
        }
    }, { immediate: true });

    return {
        referenceMap,
    };
};
