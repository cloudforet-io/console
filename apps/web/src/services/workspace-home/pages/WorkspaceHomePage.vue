<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { UserConfigModel } from '@/schema/config/user-config/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { RoleInfo } from '@/store/modules/user/type';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import Bookmark from '@/services/workspace-home/components/Bookmark.vue';
import Summaries from '@/services/workspace-home/components/Summaries.vue';
import UserConfigs from '@/services/workspace-home/components/UserConfigs.vue';
import Welcome from '@/services/workspace-home/components/Welcome.vue';
import WorkspaceInfo from '@/services/workspace-home/components/WorkspaceInfo.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const bookmarkStore = useBookmarkStore();

const storeState = reactive({
    getCurrentRoleInfo: computed<RoleInfo>(() => store.getters['user/getCurrentRoleInfo']),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
});
const state = reactive({
    pageAccess: computed<string[]>(() => storeState.getCurrentRoleInfo.pageAccess),
    isWorkspaceOwner: computed<boolean>(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    accessUserMenu: computed<boolean>(() => state.pageAccess.find((access) => access === IAM_ROUTE.USER._NAME || access === '*') && state.isWorkspaceOwner),
    accessAppMenu: computed<boolean>(() => state.pageAccess.find((access) => access === IAM_ROUTE.APP._NAME || access === '*') && state.isWorkspaceOwner),
});

watch(() => storeState.currentWorkspaceId, async (currentWorkspaceId) => {
    if (!currentWorkspaceId) return;
    await workspaceHomePageStore.fetchRecentList(currentWorkspaceId);
    await workspaceHomePageStore.fetchFavoriteList();
    await workspaceHomePageStore.fetchCostReportConfig();
    await workspaceHomePageStore.fetchDataSource();
    await bookmarkStore.fetchBookmarkFolderList();
    await bookmarkStore.fetchBookmarkList();
    if (state.accessUserMenu) {
        await workspaceHomePageStore.fetchWorkspaceUserList();
    }
    if (state.accessAppMenu) {
        await workspaceHomePageStore.fetchAppList();
    }
}, { immediate: true });
</script>

<template>
    <general-page-layout :key="storeState.currentWorkspaceId"
                         class="workspace-home-page"
    >
        <div class="page-contents">
            <workspace-info :access-user-menu="state.accessAppMenu"
                            :access-app-menu="state.accessAppMenu"
            />
            <welcome v-if="storeState.recentList.length === 0" />
            <bookmark />
            <user-configs v-if="storeState.recentList.length !== 0"
                          class="section"
            />
            <summaries class="section" />
        </div>
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.workspace-home-page {
    height: 100%;
    .page-contents {
        @apply flex flex-col;
        max-width: 87rem;
        padding: 0 0 2rem 0;
        margin-right: auto;
        margin-left: auto;
        .section {
            margin-top: 1rem;
        }
    }
}
</style>
