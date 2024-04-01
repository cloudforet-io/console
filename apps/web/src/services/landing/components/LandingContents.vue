<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import {
    PDataLoader, PSearch, PDivider, PButton,
} from '@spaceone/design-system';
import { sortBy } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import type { RecentConfig } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import LandingAllWorkspaces from '@/services/landing/components/LandingAllWorkspaces.vue';
import LandingEmptyContents from '@/services/landing/components/LandingEmptyContents.vue';
import LandingRecentVisits from '@/services/landing/components/LandingRecentVisits.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();
const recentState = recentStore.state;

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreState.getters.workspaceList.map((i) => ({
        ...i,
        label: i.name,
    }))),
    favoriteList: computed<FavoriteItem[]>(() => sortBy(favoriteGetters.workspaceItems, 'label')),
    recentWorkspace: computed<RecentConfig[]>(() => recentState.recentMenuList.map((i) => ({
        itemType: i.data.type,
        workspace_id: i.data.workspace_id,
        itemId: i.data.id,
    }))),
});
const state = reactive({
    loading: false,
    searchText: '',
});

onMounted(() => {
    recentStore.fetchRecent({
        type: RECENT_TYPE.WORKSPACE,
        limit: 6,
    });
});
</script>

<template>
    <div class="landing-contents">
        <div class="title-wrapper">
            <strong class="title">{{ $t('LADING.TITLE') }}</strong>
            <div class="desc">
                <div v-if="storeState.isDomainAdmin">
                    <p>{{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE_ADMIN', { cnt: storeState.workspaceList.length }) }}</p>
                    <p v-if="storeState.workspaceList.length > 0">
                        {{ $t('LADING.DESC_CLICK_OR_CREATE') }}
                    </p>
                </div>
                <p v-else
                   class="desc"
                >
                    {{ $t('LADING.DESC_ACCESSIBLE_WORKSPACE', { cnt: storeState.workspaceList.length }) }}
                    <span v-if="storeState.workspaceList.length > 0"> {{ $t('LADING.DESC_CLICK') }}</span>
                </p>
            </div>
        </div>
        <p-data-loader :loading="state.loading"
                       :data="storeState.workspaceList"
        >
            <div class="contents-wrapper">
                <p-search v-model="state.searchText"
                          :placeholder="$t('LADING.SEARCH_WORKSPACE')"
                />
                <landing-recent-visits v-if="storeState.recentWorkspace.length > 0"
                                       :recent-visits="storeState.recentWorkspace"
                />
                <landing-all-workspaces :workspace-list="storeState.workspaceList"
                                        :favorite-list="storeState.favoriteList"
                                        :is-domain-admin="storeState.isDomainAdmin"
                />
            </div>
            <template #no-data>
                <landing-empty-contents :is-domain-admin="storeState.isDomainAdmin" />
            </template>
        </p-data-loader>
        <p-divider v-if="storeState.isDomainAdmin" />
        <div v-if="storeState.isDomainAdmin"
             class="banner"
        >
            <img alt="empty-cloud-service-img"
                 src="@/assets/images/landing/img_landing_create_workspace.png"
                 class="create-workspace-img"
                 srcset="@/assets/images/img_landing_create_workspace@2x.png 2x,
                        @/assets/images/img_landing_create_workspace@3x.png 3x"
            >
            <span class="desc">{{ $t('LADING.BANNER_DESC') }}</span>
            <p-button style-type="primary"
                      size="md"
                      icon-left="ic_plus_bold"
                      class="create-button"
            >
                {{ $t('LADING.CREATE_WORKSPACE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.landing-contents {
    @apply flex flex-col;
    width: 44.5rem;
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
</style>
