<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import FNB from '@/common/modules/navigations/FNB.vue';

import LandingHeader from '@/services/landing/components/LandingHeader.vue';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

const router = useRouter();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
});
const state = reactive({
    isDomainLandingPage: computed<boolean>(() => storeState.workspaceList.length === 0),
});

watch(() => storeState.workspaceList, () => {
    if (state.isDomainLandingPage) {
        router.push({ name: LANDING_ROUTE.DOMAIN._NAME });
    } else {
        router.push({ name: LANDING_ROUTE.WORKSPACE._NAME });
    }
}, { immediate: true });
</script>

<template>
    <div class="lading-container">
        <landing-header :is-domain-landing-page="state.isDomainLandingPage" />
        <div class="scroll-contents">
            <router-view />
            <f-n-b class="fnb" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.lading-container {
    @apply relative flex flex-col w-full h-full;
    .scroll-contents {
        @apply flex flex-col items-center overflow-y-auto;
        padding-right: 1.5rem;
        padding-bottom: calc($fnb-height + 5.375rem);
        padding-left: 1.5rem;
        .fnb {
            @apply absolute w-full bg-gray-100;
            bottom: 0;
            margin-top: 2rem;
        }
    }
}
</style>
