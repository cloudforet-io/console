import { computed, type ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useInventoryNoteApi } from '@/api-clients/inventory/note/composables/use-inventory-note-api';
import type { NoteListParameters } from '@/api-clients/inventory/note/schema/api-verbs/list';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

interface UseCloudServiceNoteListQueryOptions {
    params: ComputedRef<NoteListParameters>;
    enabled?: ComputedRef<boolean>;
}

export const useCloudServiceNoteListQuery = ({ params, enabled }: UseCloudServiceNoteListQueryOptions) => {
    const { noteAPI } = useInventoryNoteApi();
    const queryClient = useQueryClient();

    const { key: noteListKey, params: noteListQueryParams } = useServiceQueryKey('inventory', 'note', 'list', {
        params: computed<NoteListParameters>(() => params.value),
    });

    const { data: noteListData, isFetching } = useScopedQuery({
        queryKey: noteListKey,
        queryFn: () => noteAPI.list(noteListQueryParams.value),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        enabled: computed(() => !!params.value && (enabled?.value ?? true)),
    }, ['DOMAIN', 'WORKSPACE']);

    return {
        data: noteListData,
        isLoading: isFetching,
        noteListQueryKey: noteListKey,
        invalidate: () => queryClient.invalidateQueries({ queryKey: noteListKey.value }),
    };
};
