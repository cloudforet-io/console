import type { ComputedRef, Ref } from 'vue';
import {
    ref, reactive, watchEffect,
} from 'vue';


import { isEqual } from 'lodash';

import type { QueryKeyArray } from '@/query/core/query-key/types/query-key-type';
import type { ReferenceItem } from '@/query/resource-query/reference-model/types/reference-type';
import { useWatchedQueryCache } from '@/query/shared/use-watched-query-cache';


export const useReferenceReactiveCache = <T extends Record<string, any>, R extends ReferenceItem>(
    queryKey: ComputedRef<QueryKeyArray>,
    adaptor: (arg: T) => ReferenceItem,
) => {
    const referenceMapRefs = reactive<Record<string, Ref<R|undefined>>>({});

    const { data: cachedData } = useWatchedQueryCache<Record<string, T>>(queryKey.value);

    watchEffect(() => {
        if (cachedData.value) {
            Object.entries(cachedData.value).forEach(([id, item]) => {
                const referenceData = adaptor(item) as R;
                if (!referenceMapRefs[id]) {
                    referenceMapRefs[id] = ref(referenceData) as Ref<R|undefined>;
                } else if (!isEqual(referenceMapRefs[id].value, referenceData)) {
                    referenceMapRefs[id].value = referenceData;
                }
            });
        }
    });

    return {
        referenceMapRefs,
    };
};
