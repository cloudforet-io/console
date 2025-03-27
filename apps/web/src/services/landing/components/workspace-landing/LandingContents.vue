<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { sortBy } from 'lodash';

import {
    PButton, PDataLoader, PDivider, screens,
} from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import type { RecentConfig } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { gray } from '@/styles/colors';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import LandingGroupWorkspaces from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingGroupWorkspaces.vue';
import LandingAllWorkspaces from '@/services/landing/components/workspace-landing/LandingAllWorkspaces.vue';
import LandingEmptyContents from '@/services/landing/components/workspace-landing/LandingEmptyContents.vue';
import LandingRecentVisits from '@/services/landing/components/workspace-landing/LandingRecentVisits.vue';
import LandingSearch from '@/services/landing/components/workspace-landing/LandingSearch.vue';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();
const recentState = recentStore.state;
const landingPageStore = useLandingPageStore();
const landingPageStoreGetters = landingPageStore.getters;

const router = useRouter();
const { width } = useWindowSize();

const userStore = useUserStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    userId: computed<string|undefined>(() => userStore.state.userId),
    loading: computed<boolean>(() => landingPageStoreGetters.loading),
    isDomainAdmin: computed<boolean>(() => userStore.getters.isDomainAdmin),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    favoriteList: computed<FavoriteItem[]>(() => sortBy(favoriteGetters.workspaceItems, 'label')),
    recentWorkspace: computed<RecentConfig[]>(() => recentState.recentMenuList.map((i) => ({
        itemType: i.data.type,
        workspaceId: i.data.workspace_id,
        itemId: i.data.id,
    }))),
});
const state = reactive({
    searchText: '',
    isSearchMode: computed(() => state.searchText !== ''),
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    searchedWorkspaceList: computed<WorkspaceModel[]>(() => (state.searchText !== ''
        ? storeState.workspaceList.filter((item) => item.name.toLowerCase()?.includes(state.searchText.toLowerCase()))
        : storeState.workspaceList)),
    refinedWorkspaceList: computed<WorkspaceModel[]>(() => (state.searchText ? state.searchedWorkspaceList : storeState.workspaceList)),
});

const handleSearch = (value: string) => {
    state.searchText = value;
};
const handleClickButton = () => {
    window.open(router.resolve({
        name: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME,
        query: {
            hasNoWorkspace: 'true',
        },
    }).href, '_blank');
};

onMounted(async () => {
    try {
        landingPageStore.setLoading(true);
        await userWorkspaceStore.load();
        await recentStore.fetchRecent({
            type: RECENT_TYPE.WORKSPACE,
            limit: 6,
        });
        await favoriteStore.fetchWorkspaceFavorite();
    } finally {
        landingPageStore.setLoading(false);
    }
});

onUnmounted(() => {
    landingPageStore.initState();
});
</script>

<template>
    <div class="landing-contents">
        <div class="title-wrapper">
            <strong class="title">{{ $t('LADING.TITLE') }}</strong>
            <div class="desc">
                <p v-if="storeState.isDomainAdmin">
                    {{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE_ADMIN') }}
                </p>
                <p v-else
                   class="desc"
                >
                    {{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE', { user_id: storeState.userId }) }}
                </p>
            </div>
        </div>
        <p-data-loader :loading="storeState.loading"
                       :data="storeState.workspaceList"
                       :loader-backdrop-color="gray[100]"
        >
            <div class="contents-wrapper">
                <landing-search @search="handleSearch" />
                <landing-recent-visits v-if="storeState.recentWorkspace.length > 0 && !state.isSearchMode"
                                       :workspace-list="storeState.workspaceList"
                                       :recent-visits="storeState.recentWorkspace"
                />
                <p-divider v-if="!state.isSearchMode" />
                <landing-all-workspaces v-show="state.isSearchMode"
                                        :workspace-list="state.refinedWorkspaceList"
                                        :favorite-list="storeState.favoriteList"
                                        :is-domain-admin="storeState.isDomainAdmin"
                                        @create="handleClickButton"
                />
                <landing-group-workspaces v-if="!state.isSearchMode"
                                          :favorite-list="storeState.favoriteList"
                                          :is-domain-admin="storeState.isDomainAdmin"
                                          :has-read-write-access="hasReadWriteAccess"
                                          @create="handleClickButton"
                />
            </div>
            <template #no-data>
                <landing-empty-contents :is-domain-admin="storeState.isDomainAdmin" />
            </template>
        </p-data-loader>
        <div v-if="hasReadWriteAccess && storeState.isDomainAdmin && storeState.workspaceList.length > 0"
             class="banner-wrapper"
        >
            <p-divider />
            <div class="banner">
                <img alt="empty-cloud-service-img"
                     src="../../../../assets/images/landing/img_landing_create_workspace.png"
                     class="create-workspace-img"
                     srcset="../../../../assets/images/landing/img_landing_create_workspace@2x.png 2x,
                        @/assets/images/landing/img_landing_create_workspace@3x.png 3x"
                >
                <span v-if="!state.isMobileSize"
                      class="desc"
                >{{ $t('LADING.BANNER_DESC') }}</span>
                <p-button style-type="primary"
                          size="md"
                          icon-left="ic_plus_bold"
                          class="create-button"
                          @click="handleClickButton"
                >
                    {{ $t('LADING.CREATE_WORKSPACE') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.landing-contents {
    @apply flex flex-col;
    min-width: 44.5rem;
    max-width: 44.5rem;
    padding-top: 5rem;
    gap: 2rem;
    .title-wrapper {
        @apply flex flex-col items-center;
        gap: 0.5rem;
        .title {
            @apply text-display-md text-gray-800;
        }
        .desc {
            @apply text-label-md text-gray-700 text-center;
        }
    }
    .contents-wrapper {
        @apply flex flex-col;
        gap: 2rem;
    }
    .banner-wrapper {
        @apply flex flex-col;
        gap: 2rem;
        .banner {
            @apply flex items-center bg-violet-200 rounded-md;
            padding: 1rem 0.75rem;
            gap: 1rem;
            background-image: url("@/assets/images/landing/img_landing_create_workspace_bg.png");
            .create-workspace-img {
                width: 3rem;
                height: 3rem;
            }
            .desc {
                @apply text-label-lg text-gray-700;
                width: 12.125rem;
            }
            .create-button {
                margin-left: auto;
            }
        }
    }

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        .data-loader-container {
            overflow: visible;
            .data-wrapper {
                overflow-y: visible;
            }
        }
    }

    @screen mobile {
        min-width: 19.5rem;
        max-width: 22.5rem;
    }
}
</style>
