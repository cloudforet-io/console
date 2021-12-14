<template>
    <p-list-card
        v-if="isVisible"
        style-type="indigo400"
        class="assigned-alert-list"
        :loading="loading"
        :items="items"
        :hoverable="true"
        @click="onClickListItem"
    >
        <template #header>
            <p-i name="ic_notification" width="1.25rem" height="1.25rem"
                 class="ic_notification"
                 color="white"
            />
            {{ $t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME_TITLE') }}
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
import { get } from 'lodash';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PListCard, PI,
} from '@spaceone/design-system';
import AlertListItem from '@/services/monitoring/alert-manager/modules/AlertListItem.vue';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { MONITORING_ROUTE } from '@/services/monitoring/routes';
import { store } from '@/store';

import dayjs from 'dayjs';
import { ALERT_STATE } from '@/services/monitoring/alert-manager/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'NewAssignedAlertListCard',
    components: {
        AlertListItem,
        PListCard,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            items: [],
            totalCount: 0,
            assignedVisible: true,
            lastCheckedTime: computed(() => store.getters['settings/getItem']('last_checked_time', MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME)),
            isVisible: computed(() => {
                if (state.totalCount && state.assignedVisible) return true;
                return false;
            }),
        });

        const assignedAlertApiQuery = new ApiQueryHelper()
            .setSort('created_at', true)
            .setFilters([
                { k: 'assignee', v: store.state.user.userId, o: '=' },
                { k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' },
            ]);

        const getAssignedAlerts = async () => {
            if (state.loading) return;
            if (state.lastCheckedTime) assignedAlertApiQuery.setOrFilters([{ k: 'created_at', v: state.lastCheckedTime, o: '>=t' }, { k: 'acknowledged_at', v: state.lastCheckedTime, o: '>=t' }]);
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    query: assignedAlertApiQuery.data,
                });

                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onHideAlerts = () => {
            state.assignedVisible = false;
            const lastCheckedTime = dayjs.utc().toISOString();
            store.dispatch('settings/setItem', {
                key: 'last_checked_time',
                value: lastCheckedTime,
                path: MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME,
            });
        };

        const onClickListItem = (idx) => {
            const alertId = get(state.items[idx], 'alert_id');
            if (alertId) vm.$router.push({ name: MONITORING_ROUTE.ALERT_MANAGER.ALERT.DETAIL._NAME, params: { id: alertId } });
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
