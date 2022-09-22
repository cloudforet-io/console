import { SpaceConnector } from 'cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from 'cloudforet/core-lib/space-connector/helper';
import type { ComputedRef } from 'vue';
import {
    computed, ref,
} from 'vue';


import { store } from '@/store';

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

const noticeConfigMap = ref<NoticeConfigMap>({});

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
    const fetchNoticeReadState = async (boardId: string) => {
        const userConfigApiQuery = new ApiQueryHelper()
            .setFilters([{
                k: 'user_id',
                v: userId.value,
                o: '=',
            },
            {
                k: 'name',
                v: `console:board:${boardId}:`,
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
    const updateNoticeReadState = async (boardId: string, postId: string, showPopup?: boolean) => {
        try {
            const result = await SpaceConnector.client.config.userConfig.set({
                user_id: store.state.user.userId,
                name: `console:board:${boardId}:${postId}`,
                data: { is_read: true, show_popup: showPopup },
            });
            noticeConfigMap.value = { ...noticeConfigMap.value, [postId]: result.data };
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const isReadMap = computed<{ [key: string]: boolean }>(() => {
        const readMap = {};
        Object.keys(noticeConfigMap.value).forEach((postId) => {
            readMap[postId] = noticeConfigMap.value[postId].is_read;
        });
        return readMap;
    });

    return {
        isReadMap,
        fetchNoticeReadState,
        updateNoticeReadState,
    };
};
