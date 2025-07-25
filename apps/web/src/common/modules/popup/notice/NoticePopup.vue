<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { usePostApi } from '@/api-clients/board/post/composables/use-post-api';
import { POST_BOARD_TYPE } from '@/api-clients/board/post/schema/constant';
import type { PostModel } from '@/api-clients/board/post/schema/model';
import { useUserConfigApi } from '@/api-clients/config/user-config/composables/use-user-config-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

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
const queryClient = useQueryClient();

const { userConfigAPI } = useUserConfigApi();
const { postAPI } = usePostApi();

const { key: userConfigQueryKey, params: userConfigQueryParams } = useServiceQueryKey('config', 'user-config', 'list', {
    params: computed(() => ({
        query: apiQueryForPostIdList,
    })),
});
const { key: postListQueryKey, params: postListQueryParams } = useServiceQueryKey('board', 'post', 'list', {
    params: computed(() => ({
        query: postListQueryHelper.data,
        board_type: POST_BOARD_TYPE.NOTICE,
    })),
});

const getPostList = async (): Promise<void> => {
    try {
        const { results: excludedPostIdList } = await queryClient.fetchQuery({
            queryKey: userConfigQueryKey,
            queryFn: () => userConfigAPI.list(userConfigQueryParams.value),
            gcTime: 1000 * 60 * 2,
            staleTime: 1000 * 60 * 2,
        });
        const { results: postList } = await queryClient.fetchQuery({
            queryKey: postListQueryKey.value,
            queryFn: () => postAPI.list(postListQueryParams.value),
            gcTime: 1000 * 60 * 2,
            staleTime: 1000 * 60 * 2,
        });
        const _excludedPostIdList = excludedPostIdList?.map((d) => d.name.split(':')[3]) ?? [];
        state.popupList = postList?.filter((d) => !_excludedPostIdList.includes(d.post_id)) ?? [];
        console.log(state.popupList);
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
