<template>
    <general-page-layout class="dashboard">
        <all-summary
            :providers="providers"
            class="col-start-1 col-end-13 lg:col-end-10"
        />
        <daily-updates class="col-start-1 sm:col-start-7 lg:col-start-10 col-end-13 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
        />
        <resource-map class="col-start-1 col-end-13 lg:col-end-10" />
        <service-accounts class="col-start-1 col-end-13 sm:col-start-6 col-end-7 lg:col-start-10 col-end-13
                                 sm:row-start-3 sm:row-end-4"
        />
        <top-projects class="col-start-1 col-end-13 lg:col-end-10" />
        <cloud-services class="col-start-1 col-end-10"
                        :more-info="true"
        />
        <collector-progress :providers="providers"
                            class="col-start-1 col-end-13 sm:col-start-6 col-end-7 lg:col-start-10 col-end-13 collector-progress"
        />
        <!--        <collectors class="col-start-1 col-end-13" />-->
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
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


export default {
    name: 'Dashboard',
    components: {
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
            providers: {},
        });

        const init = async () => {
            await vm.$store.dispatch('resource/provider/load');
            state.providers = store.state.resource.provider.items;
        };
        init();

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
        @apply grid gap-4 grid-flow-row grid-cols-12 p-4;
    }

    @screen md {
        .page-contents {
            @apply p-8;
        }
    }

    @screen xl {
        .page-contents {
            @apply p-12;
        }
    }
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
