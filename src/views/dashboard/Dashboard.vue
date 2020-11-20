<template>
    <general-page-layout class="dashboard">
        <div class="col-span-12 md:col-span-6 lg:col-span-9
                    widget-wrapper"
        >
            <all-summary :providers="providers" />
            <resource-map :providers="providers" />
            <top-projects />
            <cloud-services :more-info="true" />
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3
                    widget-wrapper"
        >
            <favorites-widget class="hidden md:block"
                              :project="project" :cloud-service="cloudService"
            />

            <daily-updates class="daily-updates" />
            <service-accounts />
            <collector-progress class="collector-progress"
                                :providers="providers"
            />
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
import ResourceMap from '@/views/common/components/widgets/resource-map/ResourceMap.vue';
import CollectorProgress from '@/views/common/components/widgets/collector-progress/CollectorProgress.vue';

import { store } from '@/store';
import FavoritesWidget from '@/views/common/components/widgets/favorites/FavoritesWidget.vue';


export default {
    name: 'Dashboard',
    components: {
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
        @apply grid gap-4 grid-cols-12 p-6;
    }
}

.widget-wrapper {
    @apply grid gap-4 grid-flow-row grid-cols-1;
}

.daily-updates {
    height: 33.75rem;
}

.widget-layout::v-deep {
    @apply border border-gray-100;
    border-radius: 0.375rem;
    .item-container.card .contents {
        padding: 1rem 1rem 1rem 0.75rem;
    }
}

@screen lg {
    .daily-updates {
        height: 48rem;
    }
}
</style>
