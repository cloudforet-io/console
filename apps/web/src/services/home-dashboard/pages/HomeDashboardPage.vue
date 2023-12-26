<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import CloudServices from '@/services/asset-inventory/components/CloudServices.vue';
import AllSummary from '@/services/home-dashboard/components/AllSummary.vue';
import CollectorProgress from '@/services/home-dashboard/components/CollectingProgress.vue';
import PersonalHealthDashboard
    from '@/services/home-dashboard/components/PersonalHealthDashboard.vue';
import ResourceMap from '@/services/home-dashboard/components/ResourceMap.vue';
import ServiceAccounts from '@/services/home-dashboard/components/ServiceAccounts.vue';
import TopProjects from '@/services/home-dashboard/components/TopProjects.vue';
import TrustedAdvisor from '@/services/home-dashboard/components/TrustedAdvisor.vue';


const workspaceStore = useWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed(() => workspaceStore.getters.currentWorkspaceId),
});
</script>

<template>
    <general-page-layout :key="storeState.currentWorkspaceId"
                         class="home-dashboard"
    >
        <div class="col-span-12 lg:col-span-9
                    widget-wrapper"
        >
            <all-summary class="col-span-12" />
            <resource-map class="col-span-12" />
            <personal-health-dashboard class="col-span-12" />
            <trusted-advisor class="col-span-12" />
            <top-projects class="col-span-12" />
        </div>
        <div class="col-span-12 lg:col-span-3
                    widget-wrapper"
        >
            <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
            >
                <daily-updates class="col-span-12 daily-updates" />
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
            >
                <service-accounts class="col-span-12" />
                <collector-progress class="col-span-12 collector-progress" />
                <cloud-services class="col-span-12 cloud-services"
                                :more-info="true"
                />
            </div>
        </div>
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.home-dashboard {
    @apply bg-gray-100;
    height: auto;

    /* customize general-page-layout */
    :deep(.page-contents) {
        @apply bg-gray-100 grid-cols-12;
        display: grid;
        grid-auto-flow: row;
        max-width: 1368px;
        grid-gap: 1.25rem;
        padding: 1.5rem;
        margin: 0 auto;
    }
}

.widget-wrapper {
    @apply grid-cols-12;
    grid-auto-rows: max-content;
    display: inline-grid;
    grid-gap: 1.25rem;
}

.daily-updates {
    height: 33.75rem;
}

@screen lg {
    .daily-updates {
        height: 48rem;
    }
}
</style>
