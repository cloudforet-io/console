<template>
    <p-list-card style-type="yellow100">
        <template #header>
            {{ $t('MONITORING.ALERT.DASHBOARD.MAINTENANCE_WINDOW') }} ({{ totalCount > 15 ? '15+' : totalCount }})
        </template>
        <template #item="{item, index}">
            <alert-list-item :item="item" />
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


export default {
    name: 'ProjectMaintenanceWindowListItem',
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
            apiQuery.setSort('created_at', true).setPage(1, 15);
            return apiQuery.data;
        };
        const listAlerts = async () => {
            // try {
            //     state.loading = true;
            //     const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
            //         project_id: props.projectId,
            //         query: getQuery(),
            //     });
            //     state.items = results;
            //     state.totalCount = total_count;
            // } catch (e) {
            //     console.error(e);
            // } finally {
            //     state.loading = false;
            // }
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

</style>
