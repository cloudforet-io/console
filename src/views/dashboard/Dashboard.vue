<template>
    <general-page-layout class="dashboard">
        <div class="col-span-12 lg:col-span-9
                    widget-wrapper"
        >
            <all-summary class="col-span-12" />
            <resource-map class="col-span-12" :providers="providers" />
            <personal-health-dashboard class="col-span-12" :providers="providers" />
            <trusted-advisor class="col-span-12" :providers="providers" />
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
                <collector-progress class="col-span-12 collector-progress"
                                    :providers="providers"
                                    :timezone="timezone"
                />
                <cloud-services class="col-span-12 cloud-services" />
            </div>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import CloudServices from '@/views/common/components/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/components/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/components/widgets/service-accounts/ServiceAccounts.vue';
import AllSummary from '@/views/common/components/widgets/all-summary/AllSummary.vue';
import TopProjects from '@/views/common/components/widgets/top-projects/TopProjects.vue';
import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import ResourceMap from '@/views/common/components/widgets/region-map/RegionMap.vue';
import CollectorProgress from '@/views/common/components/widgets/collector-progress/CollectingProgress.vue';
import FavoritesWidget from '@/views/common/components/widgets/favorites/FavoritesWidget.vue';
import TrustedAdvisor from '@/views/common/components/widgets/trusted-advisor/TrustedAdvisor.vue';
import PersonalHealthDashboard
    from '@/views/common/components/widgets/personal-health-dashboard/PersonalHealthDashboard.vue';


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
    .page-contents {
        @apply grid grid-flow-row grid-cols-12 p-6 mx-auto;
        max-width: 1368px;
        grid-gap: 1.25rem;
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

.cloud-services {
    max-height: 100%;
}

@screen lg {
    .daily-updates {
        height: 48rem;
    }
}
</style>
