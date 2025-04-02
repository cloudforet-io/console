<script lang="ts" setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { queryStringToString } from '@/lib/router-query-string';

import { useQueryTags } from '@/common/composables/query-tags';

import AlertMainDataTable from '@/services/alert-manager/v1/components/AlertMainDataTable.vue';
import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/v1/constants/alert-constant';
import type {
    AlertAssignedFilter,
    AlertListPageUrlQuery,
    AlertListTableFilters,
    AlertStateFilter, AlertUrgencyFilter,
} from '@/services/alert-manager/v1/types/alert-type';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const projectDetailPageStore = useProjectDetailPageStore();

const queryTagsHelper = useQueryTags({});
queryTagsHelper.setURLQueryStringFilters(route.query.filters);
const { filters } = queryTagsHelper;

const getInitialAlertState = (): AlertStateFilter => {
    const value = queryStringToString(route.query.state);
    if (!value) return ALERT_STATE_FILTER.OPEN;
    if (value in ALERT_STATE_FILTER) return value as AlertStateFilter;
    return ALERT_STATE_FILTER.OPEN;
};
const getInitialUrgency = (): AlertUrgencyFilter => {
    const value = queryStringToString(route.query.urgency);
    if (!value) return ALERT_URGENCY_FILTER.ALL;
    if (value in ALERT_URGENCY_FILTER) return value as AlertUrgencyFilter;
    return ALERT_URGENCY_FILTER.ALL;
};
const getInitialAssigned = (): AlertAssignedFilter => {
    const value = queryStringToString(route.query.assigned);
    if (!value) return ALERT_ASSIGNED_FILTER.ALL;
    if (value in ALERT_ASSIGNED_FILTER) return value as AlertAssignedFilter;
    return ALERT_ASSIGNED_FILTER.ALL;
};
const state = reactive({
    alertState: getInitialAlertState(),
    urgency: getInitialUrgency(),
    assigned: getInitialAssigned(),
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
        queryTagsHelper.setFilters(changed.filters);
    }
    replaceAlertListPageUrlQuery(query);
};

const onChangeList = () => {
    projectDetailPageStore.getAlertCounts();
};

(() => {
    state.alertState = getInitialAlertState();
    state.urgency = getInitialUrgency();
    state.assigned = getInitialAssigned();
    queryTagsHelper.setURLQueryStringFilters(route.query.filters);
})();
</script>

<template>
    <div class="project-alert">
        <alert-main-data-table
            :project-id="props.id"
            :alert-state="state.alertState"
            :urgency="state.urgency"
            :assigned="state.assigned"
            :filters="filters"
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
