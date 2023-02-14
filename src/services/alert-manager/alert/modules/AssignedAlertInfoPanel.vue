<template>
    <p-pane-layout class="assign-alert-info">
        <p-heading heading-type="sub"
                   :title="$t('MONITORING.ALERT.ALERT_LIST.OPEN_ALERT')"
                   :total-count="totalCount"
                   use-total-count
        />
        <div class="filter-wrapper">
            <span class="filter text-alert mr-4"
                  @click="onClickAssignedAlerts(ALERT_STATE_FILTER.TRIGGERED)"
            >
                <em>{{ counts[ALERT_STATE_FILTER.TRIGGERED] }}</em>
                {{ $t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') }}
            </span>
            <span class="filter text-secondary"
                  @click="onClickAssignedAlerts(ALERT_STATE_FILTER.ACKNOWLEDGED)"
            >
                <em>{{ counts[ALERT_STATE_FILTER.ACKNOWLEDGED] }}</em>
                {{ $t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') }}
            </span>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import { PPaneLayout, PHeading } from '@spaceone/design-system';
import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ALERT_STATE_FILTER } from '@/services/alert-manager/lib/config';

export default {
    name: 'AssignedAlertInfoPanel',
    components: {
        PPaneLayout,
        PHeading,
    },
    props: {
    },
    setup(props, { emit }) {
        const state = reactive({
            countsAssignedAlerts: [],
            counts: computed(() => ({
                TRIGGERED: find(state.countsAssignedAlerts, { state: ALERT_STATE_FILTER.TRIGGERED })?.total || 0,
                ACKNOWLEDGED: find(state.countsAssignedAlerts, { state: ALERT_STATE_FILTER.ACKNOWLEDGED })?.total || 0,
                RESOLVED: find(state.countsAssignedAlerts, { state: ALERT_STATE_FILTER.RESOLVED })?.total || 0,
            })),
            totalCount: computed(() => state.counts[ALERT_STATE_FILTER.TRIGGERED] + state.counts[ALERT_STATE_FILTER.ACKNOWLEDGED]),
        });

        const getStatAlerts = async () => {
            try {
                const { results } = await SpaceConnector.client.monitoring.dashboard.alertCountByState({
                    assignee: store.state.user.userId,
                });
                state.countsAssignedAlerts = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.countsAssignedAlerts = [];
            }
        };
        const onClickAssignedAlerts = (alertFilter) => {
            emit('select', alertFilter);
        };

        /* Init */
        (async () => {
            await getStatAlerts();
        })();

        return {
            ...toRefs(state),
            onClickAssignedAlerts,
            ALERT_STATE_FILTER,
        };
    },
};
</script>

<style lang="postcss" scoped>
.assign-alert-info {
    @apply col-span-12 rounded-lg;
    padding-bottom: 1rem;

    /* custom design-system component - .p-heading */
    :deep(.p-heading) {
        margin-top: 1rem;
        margin-bottom: 0.25rem;
        .title, .total-count {
            font-size: 1rem;
        }
    }
    .filter-wrapper {
        padding-left: 1rem;
        .filter {
            font-size: 0.875rem;
            line-height: 1.5;
            em {
                @apply font-bold not-italic;
            }
            &:hover {
                @apply underline cursor-pointer;
            }
        }
    }
}
</style>
