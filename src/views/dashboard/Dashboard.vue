<template>
    <general-page-layout class="dashboard">
        <all-summary class="col-start-1 col-end-13
                                lg:col-end-10"
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
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import AllSummary from '@/views/common/widgets/all-summary/AllSummary.vue';
import TopProjects from '@/views/common/widgets/top-projects/TopProjects.vue';
import GeneralPageLayout from '@/views/common/page-layout/GeneralPageLayout.vue';
import Collectors from '@/views/common/widgets/collectors/Collectors.vue';


export default {
    name: 'Dashboard',
    components: {
        GeneralPageLayout,
        CloudServices,
        DailyUpdates,
        ServiceAccounts,
        AllSummary,
        TopProjects,
        Collectors,
    },
    setup() {
        const topics = ({
            server: api => api.setTopic('daily_server_updates'),
            cloudService: api => api.setTopic('daily_cloud_service_updates'),
        });

        return {
            topics,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard::v-deep {
    background: rgba(theme('colors.gray.100'), 0.5);

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
