<template>
    <widget-layout :title="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE')">
        <p-data-table
            :loading="loading"
            :fields="fields"
            :items="data"
            :bordered="false"
        >
        </p-data-table>
    </widget-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
    ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';


export default {
    name: 'PersonalHealthDashboard',
    components: {
        PDataTable,
        WidgetLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            data: [],
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.EVENT') },
                { name: 'region', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.REGION') },
                { name: 'project_affected', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PROJECT_AFFECTED') },
            ]),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-data-table::v-deep {
    min-height: 8rem;
    border-radius: 0.125rem;
    margin-top: 0.75rem;
    th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
    }
    td {
        height: 2rem;
        .col-rank {
            @apply text-gray-600;
        }
        .link-text {
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
