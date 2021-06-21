<template>
    <p-list-card
        v-if="totalCount > 0 && assignedVisible"
        :items="items"
        :hoverable="true"
        class="assigned-alert-list"
        style-type="indigo400"
        @click="onClickListItem"
    >
        <template #header>
            <p-i name="ic_notification" width="1.25rem" height="1.25rem"
                 class="ic_notification"
                 color="white"
            />
            {{ $t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_YOU_TITLE') }}
            <p-i name="ic_delete" width="1.25rem" height="1.25rem"
                 class="ic_delete cursor-pointer"
                 color="inherit"
                 @click="onHideAlerts"
            />
        </template>
        <template #item="{item, index}">
            <alert-list-item :item="item"
                             :show-project-link="true"
            />
        </template>
    </p-list-card>
</template>
<script lang="ts">
import {
    PListCard, PI,
} from '@spaceone/design-system';
import AlertListItem from '@/views/monitoring/alert/components/AlertListItem.vue';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { get } from 'lodash';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { store } from '@/store';

export default {
    name: 'AlertAssignedList',
    components: {
        AlertListItem,
        PListCard,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: [],
            totalCount: 0,
            assignedVisible: true,
        });

        const assignedAlertApiQuery = new ApiQueryHelper()
            .setSort('created_at', true)
            .setFilters([{ k: 'assignee', v: store.state.user.userId, o: '=' }]);
        const getAssignedAlerts = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({ query: assignedAlertApiQuery.data });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                console.error(e);
            }
        };

        /* event */
        const onHideAlerts = () => {
            state.assignedVisible = false;
        };
        const onClickListItem = (idx) => {
            const alertId = get(state.items[idx], 'alert_id');
            if (alertId) vm.$router.push({ name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.DETAIL._NAME, params: { id: alertId } });
        };

        /* init */
        (async () => {
            await getAssignedAlerts();
        })();

        return {
            ...toRefs(state),
            getAssignedAlerts,
            onHideAlerts,
            onClickListItem,
        };
    },
};
</script>
<style lang="postcss" scoped>
.assigned-alert-list::v-deep {
    header {
        @apply flex items-center;

        .ic_notification {
            @apply inline-block;
            margin-right: 0.25rem;
        }
        .ic_delete {
            @apply ml-auto;
        }
    }
    .body {
        @apply overflow-y-auto;
        max-height: 10.5rem;
    }
}
</style>
