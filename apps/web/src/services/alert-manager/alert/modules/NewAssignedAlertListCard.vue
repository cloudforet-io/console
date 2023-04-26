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
            <p-i name="ic_megaphone-filled"
                 width="1.25rem"
                 height="1.25rem"
                 class="ic_notification"
                 color="white"
            />
            {{ $t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME_TITLE') }}
            <p-i name="ic_close"
                 width="1.25rem"
                 height="1.25rem"
                 class="delete-button"
                 color="inherit"
                 @click="onHideAlerts"
            />
        </template>
        <template #item="{ item }">
            <alert-list-item :item="item"
                             :show-project-link="true"
                             :project-reference="storeState.projects[item.project_id]"
                             :user-reference="storeState.users[item.assignee]"
            />
        </template>
    </p-list-card>
</template>
<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PListCard, PI,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ALERT_STATE } from '@/services/alert-manager/lib/config';
import AlertListItem from '@/services/alert-manager/modules/AlertListItem.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { useAlertManagerSettingsStore } from '@/services/alert-manager/store/alert-manager-settings-store';

export default {
    name: 'NewAssignedAlertListCard',
    components: {
        AlertListItem,
        PListCard,
        PI,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const storeState = reactive({
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
        });
        const alertManagerSettingsStore = useAlertManagerSettingsStore();


        const state = reactive({
            loading: false,
            items: [],
            totalCount: 0,
            assignedVisible: true,
            lastCheckedTime: alertManagerSettingsStore.getAlertLastCheckTime,
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
            alertManagerSettingsStore.setAlertLastCheckTime(lastCheckedTime);
        };

        const onClickListItem = (idx) => {
            const alertId = get(state.items[idx], 'alert_id');
            if (alertId) vm.$router.push({ name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME, params: { id: alertId } });
        };

        /* init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/user/load'),
                getAssignedAlerts(),
            ]);
        })();

        return {
            ...toRefs(state),
            storeState,
            getAssignedAlerts,
            onHideAlerts,
            onClickListItem,
        };
    },
};
</script>
<style lang="postcss" scoped>
/* custom design-system component - p-list-card */
:deep(.assigned-alert-list) {
    header {
        @apply flex items-center;

        .ic_notification {
            @apply inline-block;
            margin-right: 0.25rem;
        }
        .delete-button {
            @apply ml-auto;
            cursor: pointer;
        }
    }
    .body {
        @apply overflow-y-auto;
        max-height: 10.5rem;
    }
}
</style>
