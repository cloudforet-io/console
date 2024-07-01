<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { RoleInfo } from '@/store/modules/user/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import Bookmark from '@/services/workspace-home/components/Bookmark.vue';
import Summaries from '@/services/workspace-home/components/Summaries.vue';
import UserConfigs from '@/services/workspace-home/components/UserConfigs.vue';
import Welcome from '@/services/workspace-home/components/Welcome.vue';
import WorkspaceInfo from '@/services/workspace-home/components/WorkspaceInfo.vue';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const bookmarkStore = useBookmarkStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    getCurrentRoleInfo: computed<RoleInfo>(() => store.getters['user/getCurrentRoleInfo']),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    dataSource: computed<CostDataSourceModel[]>(() => workspaceHomePageState.dataSource),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
});
const state = reactive({
    loading: false,
    pageAccess: computed<string[]>(() => storeState.getCurrentRoleInfo.pageAccess),
    isWorkspaceOwner: computed<boolean>(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    accessUserMenu: computed<boolean>(() => state.pageAccess.find((access) => access === IAM_ROUTE.USER._NAME || access === '*') && state.isWorkspaceOwner),
    accessAppMenu: computed<boolean>(() => state.pageAccess.find((access) => access === IAM_ROUTE.APP._NAME || access === '*') && state.isWorkspaceOwner),
    isNoServiceAccounts: computed(() => !Object.keys(storeState.serviceAccounts).length),
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
});

watch(() => storeState.currentWorkspaceId, async (currentWorkspaceId) => {
    await workspaceHomePageStore.init();
    if (!currentWorkspaceId) return;

    state.loading = true;
    try {
        // base API
        await workspaceHomePageStore.fetchRecentList(currentWorkspaceId);
        await workspaceHomePageStore.fetchDataSource();
    } finally {
        state.loading = false;
    }

    // workspace info
    if (state.accessUserMenu) {
        await workspaceHomePageStore.fetchWorkspaceUserList();
    }
    if (state.accessAppMenu) {
        await workspaceHomePageStore.fetchAppList();
    }
    // bookmark
    await bookmarkStore.fetchBookmarkFolderList();
    await bookmarkStore.fetchBookmarkList();
    // configs
    await workspaceHomePageStore.fetchFavoriteList();
    // summaries
    if (!state.isWorkspaceMember) {
        await workspaceHomePageStore.fetchCostReportConfig();
    }
}, { immediate: true });
</script>

<template>
    <general-page-layout :key="storeState.currentWorkspaceId"
                         class="workspace-home-page"
                         is-centered
    >
        <div class="page-contents">
            <workspace-info :access-user-menu="state.accessAppMenu"
                            :access-app-menu="state.accessAppMenu"
            />
            <welcome
                v-if="!state.loading
                    && ((state.isNoCollectors || state.isNoServiceAccounts) && storeState.dataSource.length === 0)"
            />
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
