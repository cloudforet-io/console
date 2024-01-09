<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import MyPageGNBHeader from '@/common/modules/navigations/gnb/modules/MyPageGNBHeader.vue';
import MyPageGNBToolset from '@/common/modules/navigations/gnb/modules/MyPageGNBToolset.vue';

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
    if (state.beforeWorkspace) {
        router.push({ name: ROOT_ROUTE.WORKSPACE._NAME, params: { workspaceId: state.beforeWorkspace } });
        return;
    }
    router.push({ name: ROOT_ROUTE._NAME });
};
</script>

<template>
    <div class="my-page-gnb">
        <div class="left-part">
            <my-page-g-n-b-header ref="gnbHeaderRef"
                                  :to="state.workspaceLink"
            />
            <p-button v-if="state.hasRole"
                      style-type="transparent"
                      class="back-to-workspace-button"
                      icon-left="ic_arrow-left"
                      @click="handleBackToWorkspace"
            >
                <span class="link-text">{{ state.backLinkText }}</span>
                <span class="link-text-mobile">{{ $t('COMMON.GNB.MY_PAGE.BACK_LINK_SHORT') }}</span>
            </p-button>
        </div>
        <my-page-g-n-b-toolset class="right-part" />
    </div>
</template>


<style lang="postcss" scoped>
.my-page-gnb {
    @apply bg-white items-center;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .left-part {
        @apply h-full w-full flex items-center;

        .back-to-workspace-button {
            @apply flex items-center text-gray-900 text-label-md font-bold gap-1;
            padding: 0 0.75rem;
            margin-left: 0.75rem;

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
