<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { GrantInfo } from '@/store/modules/user/type';

import FNB from '@/common/modules/navigations/FNB.vue';

import LandingHeader from '@/services/landing/components/workspace-landing/LandingHeader.vue';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const landingPageStore = useLandingPageStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    currentGrantInfo: computed<GrantInfo|undefined>(() => store.state.user.currentGrantInfo),
});

watch(() => storeState.workspaceList, (workspaceList) => {
    if (!storeState.currentGrantInfo) return;
    const { force } = route.params;
    const isLanding = route.name === LANDING_ROUTE.DOMAIN._NAME;

    if (force === 'true') return;

    const targetRoute = workspaceList.length === 0 || isLanding
        ? LANDING_ROUTE.DOMAIN._NAME
        : LANDING_ROUTE.WORKSPACE._NAME;

    router.push({ name: targetRoute }).catch(() => {});
}, { immediate: true });

onUnmounted(() => {
    landingPageStore.reset();
});
</script>

<template>
    <div class="lading-container">
        <landing-header />
        <div class="scroll-contents">
            <router-view />
        </div>
        <f-n-b class="fnb" />
    </div>
</template>

<style scoped lang="postcss">
.lading-container {
    @apply relative flex flex-col w-full h-full;
    .scroll-contents {
        @apply flex flex-col items-center overflow-y-auto;
        padding-right: 1.5rem;
        padding-bottom: 2rem;
        padding-left: 1.5rem;
        flex: 1;
        .fnb {
            @apply absolute w-full bg-gray-100;
            bottom: 0;
            margin-top: 2rem;
        }
    }
}
</style>
