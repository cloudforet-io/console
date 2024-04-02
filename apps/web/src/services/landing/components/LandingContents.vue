<script setup lang="ts">
import Vue, {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PDataLoader, PSearch, PDivider, PButton,
} from '@spaceone/design-system';
import { sortBy } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import type { RecentConfig } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import LandingAllWorkspaces from '@/services/landing/components/LandingAllWorkspaces.vue';
import LandingEmptyContents from '@/services/landing/components/LandingEmptyContents.vue';
import LandingRecentVisits from '@/services/landing/components/LandingRecentVisits.vue';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';



const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();
const recentState = recentStore.state;
const landingPageStore = useLandingPageStore();
const landingPageStoreGetters = landingPageStore.getters;
const appContextStore = useAppContextStore();

const router = useRouter();

const storeState = reactive({
    loading: computed<boolean>(() => landingPageStoreGetters.loading),
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    favoriteList: computed<FavoriteItem[]>(() => sortBy(favoriteGetters.workspaceItems, 'label')),
    recentWorkspace: computed<RecentConfig[]>(() => recentState.recentMenuList.map((i) => ({
        itemType: i.data.type,
        workspace_id: i.data.workspace_id,
        itemId: i.data.id,
    }))),
});
const state = reactive({
    searchText: '',
});

const handleClickButton = () => {
    appContextStore.enterAdminMode();
    router.push({
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
        query: {
            hasNoWorkpspace: 'true',
        },
    });
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
};

onMounted(async () => {
    try {
        await landingPageStore.setLoading(true);
        // TODO: will be updated
        // await landingPageStore.listRoles();
        await recentStore.fetchRecent({
            type: RECENT_TYPE.WORKSPACE,
            limit: 4,
        });
        await favoriteStore.fetchFavorite(FAVORITE_TYPE.WORKSPACE);
    } finally {
        await landingPageStore.setLoading(false);
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
        <p-data-loader :loading="storeState.loading"
                       :data="storeState.workspaceList"
        >
            <div class="contents-wrapper">
                <p-search v-model="state.searchText"
                          :placeholder="$t('LADING.SEARCH_WORKSPACE')"
                />
                <landing-recent-visits v-if="storeState.recentWorkspace.length > 0"
                                       :workspace-list="storeState.workspaceList"
                                       :recent-visits="storeState.recentWorkspace"
                />
                <landing-all-workspaces :workspace-list="storeState.workspaceList"
                                        :favorite-list="storeState.favoriteList"
                                        :is-domain-admin="storeState.isDomainAdmin"
                                        @create="handleClickButton"
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
                 srcset="@/assets/images/landing/img_landing_create_workspace@2x.png 2x,
                        @/assets/images/landing/img_landing_create_workspace@3x.png 3x"
            >
            <span class="desc">{{ $t('LADING.BANNER_DESC') }}</span>
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
