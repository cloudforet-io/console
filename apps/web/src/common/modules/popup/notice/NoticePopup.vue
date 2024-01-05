<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import type { NoticeConfigData } from '@/schema/board/post/type';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import NoticePopupItem from '@/common/modules/popup/notice/modules/NoticePopupItem.vue';

const state = reactive({
    isSessionExpired: computed<boolean>(() => store.state.user.isSessionExpired),
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
    popupList: [] as PostModel[],
});

// helper
const apiQueryForPostIdList = new ApiQueryHelper().setFilters([{
    k: 'name',
    v: `console:board:${POST_BOARD_TYPE.NOTICE}:`,
    o: '',
}, {
    k: 'data.show_popup',
    v: true,
    o: '!=',
}]).data;
const postListQueryHelper = new ApiQueryHelper().setSort('created_at', false);

// API
const getUserConfigBoardPostIdList = async (): Promise<Array<string>> => {
    try {
        const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel<NoticeConfigData>>>({
            query: apiQueryForPostIdList,
        });
        return results ? results.map((d) => d.name.split(':')[3]) : [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const getPostList = async (): Promise<void> => {
    try {
        const { results } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
            query: postListQueryHelper.data,
            is_popup: true,
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        const postIdList = await getUserConfigBoardPostIdList();
        state.popupList = results?.filter((d) => !postIdList.includes(d.post_id)) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.popupList = [];
    }
};

watch(() => state.isSessionExpired, async (isSessionExpired) => {
    if (!isSessionExpired && !state.isNoRoleUser) await getPostList();
}, { immediate: true });
</script>

<template>
    <fragment>
        <notice-popup-item
            v-for="(item, index) in state.popupList"
            v-show="!state.isSessionExpired"
            :key="`notice-item-${index}`"
            :popup-index="index"
            :item="item"
        />
    </fragment>
</template>
