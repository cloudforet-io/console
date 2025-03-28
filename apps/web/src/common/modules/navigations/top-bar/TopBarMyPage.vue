<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import MyPageTopBarHeader from '@/common/modules/navigations/top-bar/modules/top-bar-header/MyPageTopBarHeader.vue';
import TopBarMyPageToolset from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/TopBarMyPageToolset.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const router = useRouter();
const route = useRoute();

const state = reactive({
    workspaceLink: computed(() => (state.hasRole ? { name: ROOT_ROUTE._NAME } : null)),
    hasRole: computed(() => userWorkspaceStore.getters.workspaceList.length > 0),
    beforeWorkspace: computed(() => route.query?.beforeWorkspace as string|undefined),
    backLinkText: computed(() => {
        if (state.beforeWorkspace === 'admin') {
            return i18n.t('COMMON.GNB.MY_PAGE.BACK_LINK_ADMIN');
        }
        return i18n.t('COMMON.GNB.MY_PAGE.BACK_LINK_WORKSPACE');
    }),
});

const handleBackToWorkspace = () => {
    appContextStore.setGlobalGrantLoading(true);
    if (state.beforeWorkspace === 'admin') {
        router.push({ name: ROOT_ROUTE.ADMIN._NAME });
        return;
    }
    if (state.beforeWorkspace === 'landing') {
        router.push({ name: ROOT_ROUTE.WORKSPACE._NAME }).catch(() => {});
        return;
    }
    if (state.beforeWorkspace) {
        router.push({ name: ROOT_ROUTE.WORKSPACE._NAME, params: { workspaceId: state.beforeWorkspace } });
        return;
    }
    router.push({ name: ROOT_ROUTE._NAME }).catch(() => {});
};
</script>

<template>
    <div class="my-page-top-bar">
        <div class="left-part">
            <my-page-top-bar-header ref="topBarHeaderRef"
                                    :to="state.workspaceLink"
            />
            <p-button v-if="state.hasRole"
                      style-type="secondary"
                      class="back-to-workspace-button"
                      size="sm"
                      @click="handleBackToWorkspace"
            >
                <span class="link-text">{{ state.backLinkText }}</span>
                <span class="link-text-mobile">{{ $t('COMMON.GNB.MY_PAGE.BACK_LINK_SHORT') }}</span>
            </p-button>
        </div>
        <top-bar-my-page-toolset class="right-part" />
    </div>
</template>


<style lang="postcss" scoped>
.my-page-top-bar {
    @apply bg-white items-center border-b border-gray-200;
    display: flex !important;
    height: $top-bar-height;

    .left-part {
        @apply h-full w-full flex items-center;

        .back-to-workspace-button {
            @apply flex items-center text-violet-600 text-label-sm font-bold;
            padding: 0.25rem 0.5rem;
            margin-left: 1.5rem;

            .link-text-mobile {
                display: none;
            }

            @screen mobile {
                .link-text {
                    display: none;
                }
                .link-text-mobile {
                    display: inline-block;
                }
            }
        }
    }

    .right-part {
        @apply absolute inline-flex items-center;
        right: 0;
        padding-right: 1.5rem;
    }
}
</style>
