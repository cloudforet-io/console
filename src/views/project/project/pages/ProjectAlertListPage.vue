<template>
    <div class="project-alert">
        <alert-data-table
            :project-id="id"
            :alert-state="alertState"
            :urgency="urgency"
            :assigned="assigned"
            :filters="filters"
            keep-alive
            @update="onUpdateTable"
        />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    getCurrentInstance,
    onActivated, reactive, toRefs,
} from '@vue/composition-api';
import AlertDataTable from '@/views/monitoring/alert-manager/modules/alert-list/AlertDataTable.vue';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/views/monitoring/alert-manager/lib/config';
import { AlertListPageUrlQuery, AlertListTableFilters } from '@/views/monitoring/alert-manager/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';

export default {
    name: 'ProjectAlertListPage',
    components: {
        AlertDataTable,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            alertState: vm.$route.query.state ?? ALERT_STATE_FILTER.OPEN,
            urgency: vm.$route.query.urgency ?? ALERT_URGENCY.ALL,
            assigned: vm.$route.query.assigned ?? ASSIGNED_STATE.ALL,
            filters: tagQueryHelper.filters,
        });

        /* util */
        const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
            vm.$router.replace({
                query: {
                    ...vm.$route.query,
                    ...query,
                },
            }).catch(() => {});
        };
        const onUpdateTable = (changed: Partial<AlertListTableFilters>) => {
            const query: AlertListPageUrlQuery = {};
            if (changed.state) {
                state.alertState = changed.state;
                query.state = changed.state;
            }
            if (changed.urgency) {
                state.urgency = changed.urgency;
                query.urgency = changed.urgency;
            }
            if (changed.assigned) {
                state.assigned = changed.assigned;
                query.assigned = changed.assigned;
            }
            if (changed.filters) {
                tagQueryHelper.setFilters(changed.filters);
                query.filters = tagQueryHelper.rawQueryStrings;
            }
            replaceAlertListPageUrlQuery(query);
        };

        onActivated(() => {
            state.alertState = vm.$route.query.state ?? ALERT_STATE_FILTER.OPEN;
            state.urgency = vm.$route.query.urgency ?? ALERT_URGENCY.ALL;
            state.assigned = vm.$route.query.assigned ?? ASSIGNED_STATE.ALL;
            state.filters = tagQueryHelper.setFiltersAsRawQueryString(vm.$route.query.filters).filters;
        });

        return {
            ...toRefs(state),
            onUpdateTable,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-alert::v-deep {
    .p-toolbox-table {
        @apply border-0;
        .p-data-table {
            th:nth-child(8), td:nth-child(8) {
                @apply hidden;
            }
        }
    }
}
</style>
