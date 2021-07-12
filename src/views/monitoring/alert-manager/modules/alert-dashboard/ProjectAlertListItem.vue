<template>
    <p-list-card :items="items">
        <template #header>
            {{ $t('MONITORING.ALERT.DASHBOARD.OPEN_ALERT') }} ({{ totalCount > 15 ? '15+' : totalCount }})
        </template>
        <template #item="{item, index}">
            <alert-list-item :item="item" :show-status-message="true" />
        </template>
    </p-list-card>
</template>

<script lang="ts">
import { PListCard } from '@spaceone/design-system';

import AlertListItem from '@/views/monitoring/alert-manager/components/AlertListItem.vue';
import {
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ALERT_STATE } from '@/views/monitoring/alert-manager/lib/config';


export default {
    name: 'ProjectAlertListItem',
    components: {
        PListCard,
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
                .setPage(1, 15)
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
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.projectId, async (projectId) => {
            if (projectId) await listAlerts();
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-list-card::v-deep {
    .body {
        max-height: 13rem;
        overflow-y: auto;
    }
}
</style>
