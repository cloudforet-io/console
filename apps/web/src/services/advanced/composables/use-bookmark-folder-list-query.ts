import type { Ref } from 'vue';
import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { useWorkspaceListQuery } from '@/services/advanced/composables/use-workspace-list-query';

interface UseBookmarkFolderListQueryReturn {
    bookmarkFolderListData: Ref<BookmarkItem[]>;
}

export const useBookmarkFolderListQuery = (): UseBookmarkFolderListQueryReturn => {
    const { workspaceListData } = useWorkspaceListQuery();

    const bookmarkListApiQuery = new ApiQueryHelper()
        .setSort('updated_at', true)
        .setFilters([
            { k: 'name', v: 'console:bookmark', o: '' },
            { k: 'data.link', v: null, o: '=' },
        ]);

    const { sharedConfigAPI } = useSharedConfigApi();
    const { key: sharedConfigQueryKey, params: sharedConfigParams } = useServiceQueryKey('config', 'shared-config', 'list', {
        params: computed(() => ({
            query: bookmarkListApiQuery.data,
        })),
    });

    const { data: sharedConfigData } = useScopedQuery({
        queryKey: sharedConfigQueryKey,
        queryFn: () => sharedConfigAPI.list(sharedConfigParams.value),
        select: (data) => data.results?.map((i) => ({
            ...i.data,
            workspaceId: i.data.workspaceId,
            id: i.name,
            updatedAt: i.updated_at,
        } as BookmarkItem)),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN']);

    return {
        bookmarkFolderListData: computed<BookmarkItem[]>(() => sharedConfigData.value?.filter((item) => {
            const workspace = workspaceListData.value.find((w) => w.workspace_id === item.workspaceId);
            return workspace?.state === 'ENABLED' || item.isGlobal;
        }) ?? []),
    };
};
