import type { ComputedRef } from 'vue';
import {
    computed,
    reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useQueryClient } from '@tanstack/vue-query';
import { sortBy } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useSharedConfigApi } from '@/api-clients/config/shared-config/composables/use-shared-config-api';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { extractBaseURL } from '@/common/components/bookmark/composables/use-bookmark';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

import { useBookmarkFolderListQuery } from './use-bookmark-forder-list-query';

interface UseBookmarkListQueryReturn {
    bookmarkList: ComputedRef<BookmarkItem[]>;
    isFetchingConfig: ComputedRef<boolean>;
    refreshBookmarkList: () => void;
}

export const useBookmarkListQuery = (): UseBookmarkListQueryReturn => {
    const bookmarkStore = useBookmarkStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const bookmarkState = reactive({
        bookmarkType: computed<BookmarkType|undefined>(() => bookmarkStore.state.bookmarkType),
        filterByFolder: computed<TranslateResult|undefined>(() => bookmarkStore.state.filterByFolder),
    });

    const currentWorkspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);
    const params = computed(() => {
        const bookmarkListApiQuery = new ApiQueryHelper()
            .setSort('updated_at', true)
            .setFilters([
                { k: 'name', v: 'console:bookmark', o: '' },
                { k: 'data.link', v: null, o: '!=' },
            ]);
        if (bookmarkState.bookmarkType === BOOKMARK_TYPE.USER) {
            bookmarkListApiQuery.addFilter({ k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' });
        } else if (bookmarkState.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
            bookmarkListApiQuery.setOrFilters([
                { k: 'workspace_id', v: '*', o: '=' },
                { k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' },
            ]);
        }
        return { query: bookmarkListApiQuery.data };
    });

    const queryClient = useQueryClient();
    const { sharedConfigAPI } = useSharedConfigApi();
    const { userConfigAPI } = useUserConfigApi();
    const { bookmarkFolderListData } = useBookmarkFolderListQuery();

    const { key: sharedConfigQueryKey, params: sharedConfigParams } = useServiceQueryKey('config', 'shared-config', 'list', { params });
    const { key: userConfigQueryKey, params: userConfigParams } = useServiceQueryKey('config', 'user-config', 'list', { params });

    const {
        data: sharedBookmarkListData,
        isFetching: isFetchingSharedConfig,
    } = useScopedQuery({
        queryKey: sharedConfigQueryKey,
        queryFn: () => sharedConfigAPI.list(sharedConfigParams.value),
        enabled: computed(() => !!currentWorkspaceId.value && bookmarkState.bookmarkType === BOOKMARK_TYPE.WORKSPACE),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);
    const {
        data: userBookmarkListData,
        isFetching: isFetchingUserConfig,
    } = useScopedQuery({
        queryKey: userConfigQueryKey,
        queryFn: () => userConfigAPI.list(userConfigParams.value),
        enabled: computed(() => !!currentWorkspaceId.value && bookmarkState.bookmarkType === BOOKMARK_TYPE.USER),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    }, ['WORKSPACE']);

    const dataFormatter = (items) => (items?.results || []).map((item) => {
        let baseURL = item.data.imgIcon;
        if (item.data.link && !item.data.imgIcon) {
            baseURL = extractBaseURL(item.data.link);
        }
        const faviconLink = baseURL ? `${baseURL}/favicon.ico` : undefined;
        return {
            ...(item.data as BookmarkItem),
            id: item.name,
            imgIcon: faviconLink,
        };
    });

    const refreshBookmarkList = () => {
        queryClient.invalidateQueries({ queryKey: bookmarkState.bookmarkType === BOOKMARK_TYPE.WORKSPACE ? sharedConfigQueryKey.value : userConfigQueryKey.value });
    };

    return {
        bookmarkList: computed(() => {
            const _bookmarkList = bookmarkState.bookmarkType === BOOKMARK_TYPE.WORKSPACE ? sharedBookmarkListData.value : userBookmarkListData.value;
            const formattedList = dataFormatter(_bookmarkList);
            const list = sortBy(formattedList, [(i) => !i.isGlobal]) ?? [];
            let filteredList: BookmarkItem[] = [];
            if (bookmarkState.filterByFolder) {
                filteredList = list.filter((i) => {
                    const bookmarkFolder = bookmarkFolderListData.value?.find((folder) => folder.name === bookmarkState.filterByFolder);
                    return i.folder === bookmarkFolder?.id;
                }) ?? [];
            } else {
                filteredList = list.filter((i) => !i.folder) ?? [];
            }
            return filteredList;
        }),
        isFetchingConfig: computed(() => isFetchingSharedConfig.value || isFetchingUserConfig.value),
        refreshBookmarkList,
    };
};
