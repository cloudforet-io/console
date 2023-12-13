import { asyncComputed } from '@vueuse/core';
import {
    computed, reactive, ref,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { BoardListParameters, BoardListResponse } from '@/schema/board/board/api-verbs/list';
import type { PostListParameters, PostListResponse } from '@/schema/board/post/api-verbs/list';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UserConfig {
    name: string;
    data?: NoticeConfigData;
    user_id?: string;
}
interface NoticeConfigData {
    is_read?: boolean,
    show_popup?: boolean,
}
type NoticeConfigMap = Record<string, NoticeConfigData>;

export const useNoticeStore = defineStore('notice', () => {
    const state = reactive({
        noticeConfigMap: {} as NoticeConfigMap,
        totalNoticeIdList: [] as string[],
        totalNoticeCount: 0,
    });

    const _boardId = ref<string|undefined>();
    let _boardLoading = false;
    let _boardErrorCount = 0;
    const _fetchNoticeBoardId = async () => {
        try {
            if (_boardId.value) return;
            if (_boardLoading) return;
            _boardLoading = true;
            const { results } = await SpaceConnector.clientV2.board.board.list<BoardListParameters, BoardListResponse>({
                name: 'Notice',
            });
            _boardId.value = results?.[0]?.board_id;
            _boardErrorCount = 0;
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
            _boardErrorCount++;
        } finally {
            _boardLoading = false;
        }
    };
    const getters = reactive({
        userId: computed<string>(() => store.state.user.userId),
        boardId: asyncComputed<string|undefined>(async () => {
            if (_boardLoading) return undefined;
            if (_boardErrorCount > 5) return undefined;
            if (!_boardId.value) await _fetchNoticeBoardId();
            return _boardId.value;
        }, undefined, { lazy: true }),
        isReadMap: computed<{ [key: string]: boolean }>(() => {
            const readMap = {};
            Object.keys(state.noticeConfigMap).forEach((postId) => {
                readMap[postId] = state.noticeConfigMap[postId].is_read;
            });
            return readMap;
        }),
        unreadNoticeCount: computed<number>(() => {
            let unreadCount = 0;
            state.totalNoticeIdList.forEach((postId) => {
                if (!getters.isReadMap[postId]) unreadCount++;
            });
            return unreadCount;
        }),
    });

    const convertUserConfigToNoticeConfigMap = (userConfigs: UserConfig[]): NoticeConfigMap => {
        const configMap: NoticeConfigMap = {};
        userConfigs.forEach((config) => {
            const nameList = config.name.split(':');
            const postId = nameList[nameList.length - 1];
            if (postId && config.data) configMap[postId] = config.data;
        });
        return configMap;
    };

    const actions = {
        fetchNoticeReadState: async () => {
            if (!getters.boardId) throw new Error('Notice board not found');
            const userConfigApiQuery = new ApiQueryHelper()
                .setFilters([{
                    k: 'user_id',
                    v: getters.userId,
                    o: '=',
                },
                {
                    k: 'name',
                    v: `console:board:${getters.boardId}:`,
                    o: '',
                }])
                .setOnly('data', 'user_id');
            try {
                const { results } = await SpaceConnector.client.config.userConfig.list({
                    query: userConfigApiQuery.data,
                });
                state.noticeConfigMap = convertUserConfigToNoticeConfigMap(results);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noticeConfigMap = {};
            }
        },
        updateNoticeReadState: async (postId: string, showPopup?: boolean) => {
            try {
                if (!getters.boardId) throw new Error('Notice board not found');
                const result = await SpaceConnector.client.config.userConfig.set({
                    user_id: store.state.user.userId,
                    name: `console:board:${getters.boardId}:${postId}`,
                    data: { is_read: true, show_popup: showPopup },
                });
                state.noticeConfigMap = { ...state.noticeConfigMap, [postId]: result.data };
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchNoticeCount: async () => {
            try {
                if (!getters.boardId) throw new Error('Notice board not found');
                const { results, total_count } = await SpaceConnector.clientV2.board.post.list<PostListParameters, PostListResponse>({
                    board_id: getters.boardId,
                    query: { only: ['post_id'] },
                    domain_id: null,
                });
                state.totalNoticeIdList = results?.map((post) => post.post_id) ?? [];
                state.totalNoticeCount = total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
            }
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
