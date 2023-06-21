<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PListCard, PAnchor,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import AlertListItem from '@/services/alert-manager/modules/AlertListItem.vue';
import { PROJECT_ROUTE } from '@/services/project/route-config';


interface Props {
    projectId: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: true,
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    items: [],
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
        const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
            project_id: props.projectId,
            query: getQuery(),
        });
        state.items = results;
        state.totalCount = total_count;
    } catch (e) {
        state.items = [];
        state.totalCount = 0;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

(async () => {
    await Promise.allSettled([
        store.dispatch('reference/user/load'),
    ]);
})();

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
            {{ t('MONITORING.ALERT.DASHBOARD.OPEN_ALERT') }} ({{ state.totalCount > 15 ? '15+' : state.totalCount }})
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
                <p-anchor :to="{ name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME, params: { id: projectId } }"
                          :text="t('MONITORING.ALERT.DASHBOARD.VIEW_ALL_OPEN_ALERTS')"
                          hide-icon
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
