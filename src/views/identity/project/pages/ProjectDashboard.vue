<template>
    <div class="grid gap-4 grid-flow-row grid-cols-12">
        <service-summary class="col-start-1 col-end-12
                                sm:col-end-5
                                lg:col-end-5"
                         title="servers" :api="servers.api"
                         :color="servers.color"
        />
        <service-summary class="col-start-1 col-end-13
                                sm:col-start-5 sm:col-end-10
                                lg:col-start-5 lg:col-end-10"
                         title="cloud services" :api="cloudServices.api"
                         :color="cloudServices.color"
        />
        <cloud-services class="col-start-1 col-end-9 lg:col-start-1 lg:col-end-10
                               sm:col-end-13 lg:row-start-2"
        />
        <service-accounts-table class="col-start-1 col-end-13 lg:col-start-1 lg:col-end-10
                             lg:row-start-3"
        />

        <daily-updates class="col-start-1 sm:col-start-7 lg:col-start-10 col-end-13
                              row-start-4 row-end-5 sm:row-start-2 sm:row-end-3 lg:row-start-1
                              daily-updates"
        />
    </div>
</template>

<script>
import CloudServices from '@/views/common/widgets/cloud-services/CloudServices.vue';
import DailyUpdates from '@/views/common/widgets/daily-updates/DailyUpdates.vue';
import ServiceAccounts from '@/views/common/widgets/service-accounts/ServiceAccounts.vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import ServiceAccountsTable from '@/views/common/widgets/service-accounts-table/ServiceAccountsTable.vue';
import { blue, secondary, secondary1 } from '@/styles/colors';
import { reactive, toRefs } from '@vue/composition-api';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'ProjectDashboard',
    components: {
        CloudServices,
        DailyUpdates,
        ServiceSummary,
        ServiceAccountsTable,
    },
    setup(props, context) {
        const state = reactive({
            projectName: '',
            projects: {
                color: blue[600],
                api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
            servers: {
                color: secondary,
                api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
            cloudServices: {
                color: secondary1,
                api: fluentApi.statisticsTest().history().query().setTopic('topic'),
            },
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style scoped>
    .daily-updates {
        height: 46.5rem;
    }
</style>
