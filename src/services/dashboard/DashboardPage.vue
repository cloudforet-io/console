<template>
    <general-page-layout class="dashboard">
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
                <favorites-widget class="hidden lg:block
                                         col-span-12"
                                  :project="project" :cloud-service="cloudService"
                />

                <daily-updates class="col-span-12 daily-updates"
                               :providers="providers"
                />
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
            >
                <service-accounts class="col-span-12" :providers="providers" />
                <collector-progress class="col-span-12 collector-progress" />
                <cloud-services class="col-span-12 cloud-services" :more-info="true" />
            </div>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import CloudServices from '@/services/inventory/cloud-service/modules/CloudServices.vue';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';
import ServiceAccounts from '@/services/dashboard/modules/ServiceAccounts.vue';
import AllSummary from '@/services/dashboard/modules/AllSummary.vue';
import TopProjects from '@/services/dashboard/modules/TopProjects.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import ResourceMap from '@/services/dashboard/modules/ResourceMap.vue';
import CollectorProgress from '@/services/dashboard/modules/CollectingProgress.vue';
import FavoritesWidget from '@/services/dashboard/modules/FavoritesWidget.vue';
import TrustedAdvisor from '@/services/dashboard/modules/TrustedAdvisor.vue';
import PersonalHealthDashboard
    from '@/services/dashboard/modules/PersonalHealthDashboard.vue';


export default {
    name: 'Dashboard',
    components: {
        PersonalHealthDashboard,
        TrustedAdvisor,
        FavoritesWidget,
        CollectorProgress,
        ResourceMap,
        GeneralPageLayout,
        CloudServices,
        DailyUpdates,
        ServiceAccounts,
        AllSummary,
        TopProjects,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            providers: computed(() => vm.$store.state.resource.provider.items),
            project: computed(() => [...vm.$store.getters['favorite/projectGroup/sortedItems'], ...vm.$store.getters['favorite/project/sortedItems']]),
            cloudService: computed(() => vm.$store.getters['favorite/cloudServiceType/sortedItems']),
            timezone: computed(() => vm.$store.state.user.timezone || 'UTC'),
        });

        /** Init */
        (async () => {
            await Promise.all([
                vm.$store.dispatch('resource/provider/load'),
                vm.$store.dispatch('resource/projectGroup/load'),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('resource/cloudServiceType/load'),
                vm.$store.dispatch('favorite/projectGroup/load'),
                vm.$store.dispatch('favorite/project/load'),
                vm.$store.dispatch('favorite/cloudServiceType/load'),
            ]);
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard::v-deep {
    @apply bg-gray-100;
    height: auto;
    .page-contents {
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
