<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    onActivated, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AlertDataTable from '@/services/alert-manager/alert/modules/AlertDataTable.vue';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/services/alert-manager/lib/config';
import type { AlertListPageUrlQuery, AlertListTableFilters } from '@/services/alert-manager/type';
import { useProjectDetailPageStore } from '@/services/project/store/project-detail-page-store';

interface Props {
    id: string;
}

withDefaults(defineProps<Props>(), {
    id: '',
});
const router = useRouter();
const route = useRoute();

const projectDetailPageStore = useProjectDetailPageStore();
// TODO: (type assertion) should be refactored
const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]);
const state = reactive({
    alertState: route.query.state ?? ALERT_STATE_FILTER.OPEN,
    urgency: route.query.urgency ?? ALERT_URGENCY.ALL,
    assigned: route.query.assigned ?? ASSIGNED_STATE.ALL,
    filters: tagQueryHelper.filters,
    hasManagePermission: useManagePermissionState(),
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
    state.urgency = route.query.urgency ?? ALERT_URGENCY.ALL;
    state.assigned = route.query.assigned ?? ASSIGNED_STATE.ALL;
    // TODO: (type assertion) should be refactored
    state.filters = tagQueryHelper.setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]).filters;
});

</script>

<template>
    <div class="project-alert">
        <alert-data-table
            :project-id="id"
            :alert-state="state.alertState"
            :urgency="state.urgency"
            :assigned="state.assigned"
            :filters="state.filters"
            :manage-disabled="!state.hasManagePermission"
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
