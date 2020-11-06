<template>
    <general-page-layout class="dashboard">
        <service-summary class="col-start-1 col-end-13
                                sm:col-end-5
                                lg:col-end-4"
                         v-bind="projectSummaryState"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-5 sm:col-end-9
                                lg:col-start-4 lg:col-end-7"
                         v-bind="serverSummaryState"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-9
                                lg:col-start-7 lg:col-end-10"
                         v-bind="cloudServiceSummaryState"
        />
        <service-accounts class="col-start-1 col-end-13 sm:col-end-7 lg:col-end-4
                                 row-start-5 row-end-6 sm:row-start-2 sm:row-end-3"
        />
        <daily-updates class="col-start-1 sm:col-start-7 lg:col-start-10 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
        />
        <top-projects class="col-start-1 col-end-13 lg:col-start-4 lg:col-end-10
                             lg:row-start-2"
        />
        <collectors class="col-start-1 col-end-13" />
        <cloud-services class="col-start-1 col-end-13"
                        :more-info="true"
        />
    </general-page-layout>
</template>

<script lang="ts">
import { Location } from 'vue-router';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';

import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import TopProjects from '@/views/common/widgets/top-projects/TopProjects.vue';
import GeneralPageLayout from '@/views/common/page-layout/GeneralPageLayout.vue';
import Collectors from '@/views/common/widgets/collectors/Collectors.vue';

import { blue, secondary, secondary1 } from '@/styles/colors';
import { TranslateResult } from 'vue-i18n';


interface SummaryState {
    type: string;
    title: string | TranslateResult;
    to: Location | string;
    color: string;
}


export default {
    name: 'Dashboard',
    components: {
        GeneralPageLayout,
        CloudServices,
        DailyUpdates,
        ServiceAccounts,
        ServiceSummary,
        TopProjects,
        Collectors,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const projectSummaryState: SummaryState = reactive({
            type: 'project',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_PROJECT')),
            to: '/project',
            color: blue[600],
        });

        const serverSummaryState: SummaryState = reactive({
            type: 'server',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_SERVER')),
            to: '/inventory/server',
            color: secondary,
        });

        const cloudServiceSummaryState: SummaryState = reactive({
            type: 'cloudService',
            title: computed(() => vm.$t('COMMON.WIDGETS.SERVICE_SUMMARY_CLOUD_SERVICE')),
            to: '/inventory/cloud-service',
            color: secondary1,
        });

        const topics = ({
            server: api => api.setTopic('daily_server_updates'),
            cloudService: api => api.setTopic('daily_cloud_service_updates'),
        });

        return {
            projectSummaryState,
            serverSummaryState,
            cloudServiceSummaryState,
            topics,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard::v-deep {
    @apply bg-primary-dark;
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
