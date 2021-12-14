<template>
    <p-list-card class="project-alert-list-item"
                 :items="items"
                 :loading="loading"
    >
        <template #header>
            {{ $t('MONITORING.ALERT.DASHBOARD.OPEN_ALERT') }} ({{ totalCount > 15 ? '15+' : totalCount }})
        </template>
        <template #item="{item, index}">
            <alert-list-item v-if="index < 15" :item="item" :show-status-message="true" />
            <div v-else class="view-all-text">
                <p-anchor :to="{ name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME, params: { id: projectId } }"
                          :text="$t('MONITORING.ALERT.DASHBOARD.VIEW_ALL_OPEN_ALERTS')"
                          :show-icon="false"
                          target="_self"
                          highlight
                />
            </div>
        </template>
    </p-list-card>
</template>

<script lang="ts">
import {
    PListCard, PAnchor,
} from '@spaceone/design-system';

import {
    reactive, toRefs, watch,
} from '@vue/composition-api';

import AlertListItem from '@/services/monitoring/alert-manager/modules/AlertListItem.vue';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ALERT_STATE } from '@/services/monitoring/alert-manager/lib/config';
import { PROJECT_ROUTE } from '@/services/project/routes';
import ErrorHandler from '@/common/composables/error/errorHandler';


export default {
    name: 'ProjectAlertListItem',
    components: {
        PListCard,
        PAnchor,
        AlertListItem,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
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

        watch(() => props.projectId, async (projectId) => {
            if (projectId) await listAlerts();
        }, { immediate: true });

        return {
            ...toRefs(state),
            PROJECT_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-list-card::v-deep {
    .body {
        overflow-y: auto;

        .view-all-text {
            text-align: center;
        }
    }
}
</style>
