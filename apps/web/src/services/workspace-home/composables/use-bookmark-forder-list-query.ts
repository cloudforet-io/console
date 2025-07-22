import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { sortBy } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';


interface UseBookmarkFolderListQueryReturn {
    bookmarkFolderListData: ComputedRef<BookmarkItem[]>;
    refreshBookmarkFolderList: () => void;
}

export const useBookmarkFolderListQuery = (): UseBookmarkFolderListQueryReturn => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const bookmarkStore = useBookmarkStore();

    const currentWorkspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);
    const bookmarkType = computed<BookmarkType|undefined>(() => bookmarkStore.state.bookmarkType);
    const params = computed(() => {
        const bookmarkFolderListApiQuery = new ApiQueryHelper()
            .setSort('updated_at', true)
            .setFilters([
                { k: 'name', v: 'console:bookmark', o: '' },
                { k: 'data.link', v: null, o: '=' },
            ]);
        if (bookmarkType.value === BOOKMARK_TYPE.USER) {
            bookmarkFolderListApiQuery.addFilter({ k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' });
        } else if (bookmarkType.value === BOOKMARK_TYPE.WORKSPACE) {
            bookmarkFolderListApiQuery.setOrFilters([
                { k: 'workspace_id', v: '*', o: '=' },
                { k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' },
            ]);
        }
        return { query: bookmarkFolderListApiQuery.data };
    });

    const queryClient = useQueryClient();
    const { sharedConfigAPI } = useSharedConfigApi();
    const { userConfigAPI } = useUserConfigApi();

    const { key: sharedConfigQueryKey, params: sharedConfigParams } = useServiceQueryKey('config', 'shared-config', 'list', { params });
    const { key: userConfigQueryKey, params: userConfigParams } = useServiceQueryKey('config', 'user-config', 'list', { params });

    const { data: sharedBookmarkFolderListData } = useScopedQuery({
        queryKey: sharedConfigQueryKey,
        queryFn: () => sharedConfigAPI.list(sharedConfigParams.value),
        enabled: computed(() => !!currentWorkspaceId.value && bookmarkType.value === BOOKMARK_TYPE.WORKSPACE),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);
    const { data: userBookmarkFolderListData } = useScopedQuery({
        queryKey: userConfigQueryKey,
        queryFn: () => userConfigAPI.list(userConfigParams.value),
        enabled: computed(() => !!currentWorkspaceId.value && bookmarkType.value === BOOKMARK_TYPE.USER),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    const dataFormatter = (items) => (items?.results || []).map((i) => ({
        ...i.data,
        id: i.name,
    } as BookmarkItem));

    const refreshBookmarkFolderList = () => {
        queryClient.invalidateQueries({ queryKey: bookmarkType.value === BOOKMARK_TYPE.WORKSPACE ? sharedConfigQueryKey.value : userConfigQueryKey.value });
    };

    return {
        bookmarkFolderListData: computed(() => {
            const _bookmarkFolderList = bookmarkType.value === BOOKMARK_TYPE.WORKSPACE ? sharedBookmarkFolderListData.value : userBookmarkFolderListData.value;
            const formattedList = dataFormatter(_bookmarkFolderList);
            return sortBy(formattedList, [(i) => !i.isGlobal]) ?? [];
        }),
        refreshBookmarkFolderList,
    };
};
