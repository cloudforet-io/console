<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PListCard, PLink,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/monitoring/alert/api-verbs/list';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertListItem from '@/services/alert-manager/v1/components/AlertListItem.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const props = defineProps<{
    projectId: string;
}>();

const allReferenceStore = useAllReferenceStore();
const state = reactive({
    loading: true,
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    items: [] as AlertModelV1[],
    totalCount: 0,
});

/* api */
const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery
        .setSort('created_at', true)
        .setPage(1, 16)
        .setFilters([{ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' }]);
    return apiQuery.data;
};
const listAlerts = async () => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.clientV2.monitoring.alert.list<AlertListParameters, ListResponse<AlertModelV1>>({
            project_id: props.projectId,
            query: getQuery(),
        });
        state.items = results ?? [];
        state.totalCount = total_count ?? 0;
    } catch (e) {
        state.items = [];
        state.totalCount = 0;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

watch(() => props.projectId, async (projectId) => {
    if (projectId) await listAlerts();
}, { immediate: true });

</script>

<template>
    <p-list-card class="project-alert-list-item"
                 :items="state.items"
                 :loading="state.loading"
    >
        <template #header>
            {{ $t('MONITORING.ALERT.DASHBOARD.OPEN_ALERT') }} ({{ state.totalCount > 15 ? '15+' : state.totalCount }})
        </template>
        <template #item="{item, index}">
            <alert-list-item v-if="index < 15"
                             :item="item"
                             :show-status-message="true"
                             :user-reference="state.users[item.assignee]"
            />
            <div v-else
                 class="view-all-text"
            >
                <p-link :to="{ name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME, params: { id: props.projectId } }"
                        :text="$t('MONITORING.ALERT.DASHBOARD.VIEW_ALL_OPEN_ALERTS')"
                        highlight
                />
            </div>
        </template>
    </p-list-card>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-list-card */
.p-list-card {
    :deep(.body) {
        overflow-y: auto;

        .view-all-text {
            text-align: center;
        }
    }
}

</style>
