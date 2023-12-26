import {
    computed, reactive,
} from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import type { NoticeConfigData } from '@/schema/board/post/type';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

type UserConfig = UserConfigModel<NoticeConfigData>;
type NoticeConfigMap = Record<string, NoticeConfigData>;

export const useNoticeStore = defineStore('notice', () => {
    const state = reactive({
        noticeConfigMap: {} as NoticeConfigMap,
        totalNoticeIdList: [] as string[],
        totalNoticeCount: 0,
    });

    const getters = reactive({
        userId: computed<string>(() => store.state.user.userId),
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
            const userConfigApiQuery = new ApiQueryHelper()
                .setFilters([{
                    k: 'user_id',
                    v: getters.userId,
                    o: '=',
                },
                {
                    k: 'name',
                    v: `console:board:${POST_BOARD_TYPE.NOTICE}:`,
                    o: '',
                }])
                .setOnly('data', 'user_id');
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel<NoticeConfigData>>>({
                    query: userConfigApiQuery.data,
                });
                state.noticeConfigMap = convertUserConfigToNoticeConfigMap(results ?? []);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noticeConfigMap = {};
            }
        },
        updateNoticeReadState: async (postId: string, showPopup?: boolean) => {
            try {
                const result = await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters<NoticeConfigData>, UserConfigModel>({
                    name: `console:board:${POST_BOARD_TYPE.NOTICE}:${postId}`,
                    data: { is_read: true, show_popup: showPopup },
                });
                state.noticeConfigMap = { ...state.noticeConfigMap, [postId]: result.data };
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchNoticeCount: async () => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
                    query: { only: ['post_id'] },
                    board_type: POST_BOARD_TYPE.NOTICE,
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
