<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type { RoleInfo } from '@/store/authorization/type';

import { MENU_ID } from '@/lib/menu/config';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import Bookmark from '@/services/workspace-home/components/Bookmark.vue';
import Summaries from '@/services/workspace-home/components/Summaries.vue';
import UserConfigs from '@/services/workspace-home/components/UserConfigs.vue';
import Welcome from '@/services/workspace-home/components/Welcome.vue';
import WorkspaceInfo from '@/services/workspace-home/components/WorkspaceInfo.vue';
import {
    useWorkspaceHomeCollectorListQuery,
} from '@/services/workspace-home/composables/use-workspace-home-collector-list-query';
import {
    useWorkspaceHomeServiceAccountListQuery,
} from '@/services/workspace-home/composables/use-workspace-home-service-account-list-query';
import { useCostDataSourceQuery } from '@/services/workspace-home/shared/composables/use-cost-data-source-query';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const authorizationStore = useAuthorizationStore();

const { dataSource } = useCostDataSourceQuery({
    enabled: computed(() => !!userWorkspaceGetters.currentWorkspaceId),
});

const storeState = reactive({
    getCurrentRoleInfo: computed<RoleInfo|undefined>(() => authorizationStore.state.currentRoleInfo),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceGetters.currentWorkspaceId),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
});

const { data: serviceAccountList } = useWorkspaceHomeServiceAccountListQuery();
const { data: collectorList } = useWorkspaceHomeCollectorListQuery();

const state = reactive({
    loading: false,
    isWorkspaceOwner: computed<boolean>(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => storeState.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    accessUserMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.USER]) && state.isWorkspaceOwner),
    accessAppMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.APP]) && state.isWorkspaceOwner),
    isNoServiceAccounts: computed(() => !serviceAccountList.value?.length),
    isNoCollectors: computed<boolean>(() => !collectorList.value?.length),
});

const { appAPI } = useAppApi();
const listCountQueryHelper = new ApiQueryHelper().setCountOnly();
const { key: appListQueryKey, params: appListQueryParams } = useServiceQueryKey('identity', 'app', 'list', {
    params: computed(() => ({
        workspace_id: storeState.currentWorkspaceId,
        query: listCountQueryHelper.data,
    })),
});
const { data: appListData } = useScopedQuery({
    queryKey: appListQueryKey,
    queryFn: () => appAPI.list(appListQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
    enabled: computed(() => state.accessAppMenu),
}, ['DOMAIN', 'WORKSPACE']);

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
                            :app-total-count="appListData?.total_count || 0"
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
