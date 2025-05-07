<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import type { NoticeConfigData } from '@/schema/board/post/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import NoticePopupItem from '@/common/modules/popup/notice/modules/NoticePopupItem.vue';

const appContextStore = useAppContextStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const state = reactive({
    isSessionExpired: computed<boolean>(() => !!userStore.state.isSessionExpired),
    isNoRoleUser: computed<boolean>(() => authorizationStore.getters.isNoRoleUser),
    popupList: [] as PostModel[],
    hasLoaded: false,
});

// helper
const apiQueryForPostIdList = new ApiQueryHelper().setFilters([{
    k: 'name',
    v: `console:board:${POST_BOARD_TYPE.NOTICE}:`,
    o: '',
}, {
    k: 'data.show_popup',
    v: false,
    o: '=',
}]).data;
const postListQueryHelper = new ApiQueryHelper()
    .setSort('created_at', false)
    .setFilters([{
        k: 'options.is_popup',
        v: true,
        o: '=',
    }]);

// API
const getUserConfigBoardPostExcludedIdList = async (): Promise<Array<string>> => {
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
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        const excludedPostIdList = await getUserConfigBoardPostExcludedIdList();
        state.popupList = results?.filter((d) => !excludedPostIdList.includes(d.post_id)) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.popupList = [];
    }
};

watch([
    () => state.hasLoaded,
    () => state.isSessionExpired,
    () => state.isNoRoleUser,
    () => appContextStore.getters.globalGrantLoading,
    () => authorizationStore.state.currentGrantInfo,
], async ([hasLoaded, isSessionExpired, isNoRoleUser, globalGrantLoading, grantInfo]) => {
    if (hasLoaded) return;
    if (isNoRoleUser || isSessionExpired) {
        state.popupList = [];
    } else if (!globalGrantLoading && grantInfo && grantInfo?.scope !== 'USER') { // grantInfo can be undefined
        await getPostList();
        state.hasLoaded = true;
    }
}, { immediate: true });

watch(() => userStore.state.userId, async (userId, prevUserId) => {
    if (userId !== prevUserId) {
        state.hasLoaded = false;
    }
});
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
