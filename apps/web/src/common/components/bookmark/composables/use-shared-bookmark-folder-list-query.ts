import {
    computed,
} from 'vue';
import type { ComputedRef } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface UseSharedBookmarkFolderListQueryReturn {
    bookmarkFolderList: ComputedRef<BookmarkItem[]>;
    isFetching: ComputedRef<boolean>;
    refresh: () => void;
}
interface UseSharedBookmarkFolderListQueryParams {
    scope: ComputedRef<BookmarkType>;
}

export const useSharedBookmarkFolderListQuery = ({ scope }: UseSharedBookmarkFolderListQueryParams): UseSharedBookmarkFolderListQueryReturn => {
    const queryClient = useQueryClient();
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);
    const currentWorkspaceId = computed(() => userWorkspaceStore.getters.currentWorkspaceId);

    const defaultFilter: ConsoleFilter[] = [
        { k: 'name', v: 'console:bookmark', o: '' },
        { k: 'data.link', v: null, o: '=' },
    ];
    if (!isAdminMode.value) {
        defaultFilter.push({ k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' });
    }

    const bookmarkFolderListApiQuery = new ApiQueryHelper()
        .setSort('updated_at', true)
        .setFilters(defaultFilter);

    const { sharedConfigAPI } = useSharedConfigApi();
    const { key: sharedConfigQueryKey, params: sharedConfigParams } = useServiceQueryKey('config', 'shared-config', 'list', {
        params: computed(() => ({ query: bookmarkFolderListApiQuery.data })),
    });

    const {
        data: bookmarkFolderListData,
        isFetching,
    } = useScopedQuery({
        queryKey: sharedConfigQueryKey,
        queryFn: () => sharedConfigAPI.list(sharedConfigParams.value),
        enabled: computed(() => scope.value !== BOOKMARK_TYPE.USER),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 2,
    }, ['DOMAIN', 'WORKSPACE']);

    const refinedBookmarkFolderList = computed(() => (bookmarkFolderListData.value?.results || []).map((i) => ({
        ...i.data,
        id: i.name,
    } as BookmarkItem)));

    const bookmarkFolderList = computed(() => (isAdminMode.value ? refinedBookmarkFolderList.value?.filter((i) => i.isGlobal) : refinedBookmarkFolderList.value));

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: sharedConfigQueryKey });
    };

    return {
        bookmarkFolderList,
        isFetching: computed(() => isFetching.value),
        refresh,
    };
};
