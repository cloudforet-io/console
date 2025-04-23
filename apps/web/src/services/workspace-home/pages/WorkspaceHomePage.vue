<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type { RoleInfo } from '@/store/authorization/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import Bookmark from '@/services/workspace-home/components/Bookmark.vue';
import Summaries from '@/services/workspace-home/components/Summaries.vue';
import UserConfigs from '@/services/workspace-home/components/UserConfigs.vue';
import Welcome from '@/services/workspace-home/components/Welcome.vue';
import WorkspaceInfo from '@/services/workspace-home/components/WorkspaceInfo.vue';
import { useCostDataSourceQuery } from '@/services/workspace-home/shared/composables/use-cost-data-source-query';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const authorizationStore = useAuthorizationStore();

const { dataSource } = useCostDataSourceQuery({
    enabled: computed(() => !!userWorkspaceGetters.currentWorkspaceId),
});

const storeState = reactive({
    getCurrentRoleInfo: computed<RoleInfo|undefined>(() => authorizationStore.state.currentRoleInfo),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    collectors: computed<CollectorReferenceMap>(() => allReferenceGetters.collector),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceGetters.serviceAccount),
});
const state = reactive({
    loading: false,
    isWorkspaceOwner: computed<boolean>(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    accessUserMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.USER]) && state.isWorkspaceOwner),
    accessAppMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.APP]) && state.isWorkspaceOwner),
    isNoServiceAccounts: computed(() => !Object.keys(storeState.serviceAccounts).length),
    isNoCollectors: computed<boolean>(() => !Object.keys(storeState.collectors).length),
});

watch(() => storeState.currentWorkspaceId, async (currentWorkspaceId) => {
    await workspaceHomePageStore.resetState();
    if (!currentWorkspaceId) return;

    state.loading = true;
    try {
        // base API
        await workspaceHomePageStore.fetchRecentList(currentWorkspaceId);
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
    await workspaceHomePageStore.fetchBookmarkFolderList();
    await workspaceHomePageStore.fetchBookmarkList();
    // configs
    await workspaceHomePageStore.fetchFavoriteList();
}, { immediate: true });
</script>

<template>
    <general-page-layout :key="storeState.currentWorkspaceId"
                         class="workspace-home-page"
                         is-centered
    >
        <div class="page-contents">
            <workspace-info :access-user-menu="state.accessUserMenu"
                            :access-app-menu="state.accessAppMenu"
            />
            <welcome
                v-if="!state.loading
                    && (state.isNoCollectors || state.isNoServiceAccounts || (dataSource && dataSource.length === 0))"
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
