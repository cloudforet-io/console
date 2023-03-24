import type { ComputedRef } from 'vue';
import {
    computed, ref,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

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

const boardId = ref<string>();
const noticeConfigMap = ref<NoticeConfigMap>({});
const isReadMap = computed<{ [key: string]: boolean }>(() => {
    const readMap = {};
    Object.keys(noticeConfigMap.value).forEach((postId) => {
        readMap[postId] = noticeConfigMap.value[postId].is_read;
    });
    return readMap;
});

export const useNoticeStore = ({ userId }: {
    userId: ComputedRef<string>,
}) => {
    const convertUserConfigToNoticeConfigMap = (userConfigs: UserConfig[]): NoticeConfigMap => {
        const configMap: NoticeConfigMap = {};
        userConfigs.forEach((config) => {
            const nameList = config.name.split(':');
            const postId = nameList[nameList.length - 1];
            if (postId && config.data) configMap[postId] = config.data;
        });
        return configMap;
    };

    const fetchNoticeReadState = async () => {
        if (!boardId.value) boardId.value = await getNoticeBoardId();
        const userConfigApiQuery = new ApiQueryHelper()
            .setFilters([{
                k: 'user_id',
                v: userId.value,
                o: '=',
            },
            {
                k: 'name',
                v: `console:board:${boardId.value}:`,
                o: '',
            }])
            .setOnly('data', 'user_id');
        try {
            const { results } = await SpaceConnector.client.config.userConfig.list({
                query: userConfigApiQuery.data,
            });
            noticeConfigMap.value = convertUserConfigToNoticeConfigMap(results);
        } catch (e) {
            ErrorHandler.handleError(e);
            noticeConfigMap.value = {};
        }
    };
    const updateNoticeReadState = async (postId: string, showPopup?: boolean) => {
        try {
            if (!boardId.value) boardId.value = await getNoticeBoardId();
            const result = await SpaceConnector.client.config.userConfig.set({
                user_id: store.state.user.userId,
                name: `console:board:${boardId.value}:${postId}`,
                data: { is_read: true, show_popup: showPopup },
            });
            noticeConfigMap.value = { ...noticeConfigMap.value, [postId]: result.data };
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const totalNoticeIdList = ref<string[]>([]);
    const totalNoticeCount = ref(0);
    const noticeApiHelper = new ApiQueryHelper().setOnly('post_id');
    const fetchNoticeCount = async () => {
        try {
            if (!boardId.value) boardId.value = await getNoticeBoardId();
            const { results, total_count } = await SpaceConnector.client.board.post.list({
                board_id: boardId.value,
                query: noticeApiHelper.data,
                domain_id: null,
            });
            totalNoticeIdList.value = results.map((post) => post.post_id);
            totalNoticeCount.value = total_count;
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
        }
    };

    const unreadNoticeCount = computed(() => {
        let unreadCount = 0;
        totalNoticeIdList.value.forEach((postId) => {
            if (!isReadMap.value[postId]) unreadCount++;
        });
        return unreadCount;
    });

    return {
        boardId,
        isReadMap,
        fetchNoticeReadState,
        updateNoticeReadState,
        totalNoticeCount,
        unreadNoticeCount,
        fetchNoticeCount,
    };
};
