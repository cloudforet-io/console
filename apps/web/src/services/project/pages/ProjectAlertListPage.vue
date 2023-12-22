<script lang="ts" setup>
import {
    onActivated, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';

import AlertMainDataTable from '@/services/alert-manager/components/AlertMainDataTable.vue';
import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/constants/alert-constant';
import type { AlertListPageUrlQuery, AlertListTableFilters } from '@/services/alert-manager/types/alert-type';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const projectDetailPageStore = useProjectDetailPageStore();
const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(route.query.filters);
const state = reactive({
    alertState: route.query.state ?? ALERT_STATE_FILTER.OPEN,
    urgency: route.query.urgency ?? ALERT_URGENCY_FILTER.ALL,
    assigned: route.query.assigned ?? ALERT_ASSIGNED_FILTER.ALL,
    filters: tagQueryHelper.filters,
});

/* util */
const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
    router.replace({
        query: {
            ...route.query,
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

const onChangeList = () => {
    projectDetailPageStore.getAlertCounts();
};

onActivated(() => {
    state.alertState = route.query.state ?? ALERT_STATE_FILTER.OPEN;
    state.urgency = route.query.urgency ?? ALERT_URGENCY_FILTER.ALL;
    state.assigned = route.query.assigned ?? ALERT_ASSIGNED_FILTER.ALL;
    state.filters = tagQueryHelper.setFiltersAsRawQueryString(route.query.filters).filters;
});
</script>

<template>
    <div class="project-alert">
        <alert-main-data-table
            :project-id="props.id"
            :alert-state="state.alertState"
            :urgency="state.urgency"
            :assigned="state.assigned"
            :filters="state.filters"
            keep-alive
            @update="onUpdateTable"
            @change-list="onChangeList"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-alert {
    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        @apply border-0;
        .p-data-table {
            th:nth-child(8), td:nth-child(8) {
                @apply hidden;
            }
        }
    }
}
</style>
