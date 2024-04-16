import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BookmarkModalType, BookmarkItem } from '@/services/workspace-home/types/workspace-home-type';

export const useBookmarkStore = defineStore('bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;

    const bookmarkListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

    const state = reactive({
        bookmarkData: [] as BookmarkItem[],
        modal: {
            loading: false,
            type: undefined as BookmarkModalType|undefined,
            visible: {
                folder: false,
                link: false,
                delete: false,
            },
        },
    });

    const _getters = reactive({
        userId: computed<string>(() => store.state.user.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });

    const getters = reactive({
        bookmarkFolderList: computed(() => state.bookmarkData.filter((i) => !i.folder)),
        bookmarkList: computed(() => state.bookmarkData.filter((i) => i.folder)),
        modal: computed(() => state.modal),
    });

    const mutations = {
        setModalType: (type?: BookmarkModalType) => {
            state.modal.type = type;
        },
    };

    const actions = {
        fetchBookmarkList: async () => {
            bookmarkListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: 'console:bookmark', o: '' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
            ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                state.bookmarkData = (results ?? []).map((i) => i.data as BookmarkItem);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
            }
        },
        createBookmarkFolder: async (name: string) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                    },
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
            }
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
