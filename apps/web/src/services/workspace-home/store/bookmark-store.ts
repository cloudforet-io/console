import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigDeleteParameters } from '@/schema/config/user-config/api-verbs/delete';
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

    const state = reactive({
        bookmarkFolderData: [] as BookmarkItem[],
        bookmarkData: [] as BookmarkItem[],
        activeFolderIndex: undefined as number|undefined,
        modal: {
            type: undefined as BookmarkModalType|undefined,
        },
    });

    const _getters = reactive({
        userId: computed<string>(() => store.state.user.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });

    const getters = reactive({
        bookmarkFolderList: computed<BookmarkItem[]>(() => state.bookmarkFolderData.filter((i) => !i.link)),
        bookmarkList: computed<BookmarkItem[]>(() => state.bookmarkData.filter((i) => i.link)),
        modalType: computed<BookmarkModalType|undefined>(() => state.modal.type),
    });

    const mutations = {
        setModalType: (type?: BookmarkModalType) => {
            state.modal.type = type;
        },
    };

    const bookmarkListApiQuery = new ApiQueryHelper()
        .setSort('updated_at', true);

    const actions = {
        fetchBookmarkFolderList: async () => {
            bookmarkListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: 'console:bookmark', o: '' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                { k: 'data.link', v: null, o: '=' },
            ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                state.bookmarkFolderData = (results ?? []).map((i) => i.data as BookmarkItem);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkFolderData = [];
            }
        },
        fetchBookmarkList: async (name?: string) => {
            bookmarkListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: 'console:bookmark', o: '' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
            ]);
            if (name) {
                bookmarkListApiQuery.addFilter({ k: 'data.folder', v: name, o: '' });
            } else {
                bookmarkListApiQuery.addFilter({ k: 'data.folder', v: null, o: '' });
            }
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
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
                throw e;
            }
        },
        createBookmarkLink: async ({ name, link, folder }: { name: string, link: string, folder?: string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${folder}:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        folder,
                        link,
                    },
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
                throw e;
            }
        },
        deleteBookmarkFolder: async (name: string) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters>({
                    name: `console:bookmark:${name}`,
                });
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
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
