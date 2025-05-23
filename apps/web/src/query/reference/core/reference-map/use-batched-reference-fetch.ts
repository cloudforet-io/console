import {
    ref,
} from 'vue';

import { referenceQueryClient as queryClient } from '@/query/clients';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';


const DEBOUNCE_MS = 300;
const BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 30;

export function useBatchedReferenceFetch<T>(
    queryKey: QueryKeyArray,
    fetchFn: (ids: string[]) => Promise<T[]>,
    getId: (item: T) => string,
) {
    const pendingSet = ref(new Set<string>());
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const enqueue = (id: string) => {
        if (!id || pendingSet.value.has(id)) return;

        pendingSet.value.add(id);

        if (pendingSet.value.size >= BATCH_SIZE) {
            _triggerFetch();
        } else {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                _triggerFetch();
            }, DEBOUNCE_MS);
        }
    };

    const _triggerFetch = async () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }


        const idsToFetch = Array.from(pendingSet.value);
        pendingSet.value.clear();
        if (idsToFetch.length === 0) return;

        const cached = queryClient.getQueryData<T[]>(queryKey) || [];
        const cachedIds = new Set(cached.map(getId));
        const ids = idsToFetch.filter((id) => !cachedIds.has(id));

        const chunks = _chunkArray(ids, MAX_BATCH_SIZE);

        const fetchedArrays = await Promise.all(chunks.map(fetchFn));
        const fetched = fetchedArrays.flat();

        const uniqueFetched = fetched.filter((item) => !cachedIds.has(getId(item)));
        const merged = [...cached, ...uniqueFetched];

        queryClient.setQueryData(queryKey, merged);
        uniqueFetched.forEach((item) => cachedIds.add(getId(item)));
    };

    return {
        enqueue,
    };
}

const _chunkArray = (array: string[], size: number): string[][] => Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
