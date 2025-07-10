import {
    computed,
} from 'vue';
import type { ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { sortBy } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { extractBaseURL } from '@/common/components/bookmark/composables/use-bookmark';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { useWorkspaceListQuery } from '@/services/advanced/composables/use-workspace-list-query';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';


interface UseBookmarkListQueryReturn {
    entireBookmarkList: ComputedRef<BookmarkItem[]>;
    bookmarkList: ComputedRef<BookmarkItem[]>;
    isFetchingSharedConfig: ComputedRef<boolean>;
    refresh: () => void;
}

export const useBookmarkListQuery = (): UseBookmarkListQueryReturn => {
    const queryClient = useQueryClient();
    const { workspaceListData } = useWorkspaceListQuery();
    const bookmarkPageStore = useBookmarkPageStore();

    const BookmarkListApiQueryHelper = new ApiQueryHelper().setSort('updated_at', true);
    const { sharedConfigAPI } = useSharedConfigApi();
    const { key: sharedConfigQueryKey, params: sharedConfigParams } = useServiceQueryKey('config', 'shared-config', 'list', {
        params: computed(() => {
            BookmarkListApiQueryHelper.setFilters(bookmarkPageStore.getters.bookmarkFilters);
            return {
                query: BookmarkListApiQueryHelper.data,
            };
        }),
    });

    const {
        data: bookmarkListData,
        isFetching: isFetchingSharedConfig,
    } = useScopedQuery({
        queryKey: sharedConfigQueryKey,
        queryFn: () => sharedConfigAPI.list(sharedConfigParams.value),
        select: (data) => (data.results || []).map((item): BookmarkItem => {
            let baseURL = item.data.imgIcon;
            if (item.data.link && !item.data.imgIcon) {
                baseURL = extractBaseURL(item.data.link);
            }
            const faviconLink = baseURL ? `${baseURL}/favicon.ico` : undefined;
            return {
                ...(item.data as BookmarkItem),
                id: item.name,
                workspaceId: item.data.workspaceId,
                updatedAt: item.updated_at,
                imgIcon: faviconLink,
            };
        }).filter((item) => {
            const workspace = workspaceListData.value.find((w) => w.workspace_id === item.workspaceId);
            return workspace?.state === 'ENABLED' || item.isGlobal;
        }),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['DOMAIN']);

    const entireBookmarkList = computed(() => {
        const globalBookmark = bookmarkListData.value?.filter((i) => i.isGlobal);
        const sortedGlobalBookmark = sortBy(globalBookmark, [(i) => !i.link, (i) => i.updatedAt]).reverse();

        const workspaceBookmark = bookmarkListData.value?.filter((i) => !i.isGlobal);
        const sortedWorkspaceBookmark = sortBy(workspaceBookmark, [(i) => !i.link, (i) => i.updatedAt]).reverse();

        const combinedBookmark = [...sortedGlobalBookmark, ...sortedWorkspaceBookmark];
        return (!bookmarkPageStore.state.params?.folder && bookmarkPageStore.state.searchFilter.length === 0)
            ? combinedBookmark.filter((i) => !i.folder)
            : combinedBookmark;
    });

    const bookmarkList = computed(() => entireBookmarkList.value.slice(
        bookmarkPageStore.state.pageStart,
        bookmarkPageStore.state.pageStart + bookmarkPageStore.state.pageLimit,
    ));

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: sharedConfigQueryKey.value });
    };

    return {
        entireBookmarkList,
        bookmarkList,
        isFetchingSharedConfig: computed(() => isFetchingSharedConfig.value),
        refresh,
    };
};
