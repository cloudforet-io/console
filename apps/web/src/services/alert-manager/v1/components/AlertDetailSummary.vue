<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import {
    PButton, PPaneLayout, PSelectDropdown, PI, PBadge,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { AlertState, AlertUrgency } from '@/schema/monitoring/alert/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { red } from '@/styles/colors';

import AlertDetailSummaryAssignModal from '@/services/alert-manager/v1/components/AlertDetailSummaryAssignModal.vue';
import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';

const props = withDefaults(defineProps<{
    id: string;
    manageDisabled?: boolean;
    hasReadWriteAccess?: boolean;
}>(), {
    manageDisabled: false,
});

const calculateTime = (time) => {
    const today = dayjs().toISOString();
    const createdTime = iso8601Formatter(time, 'UTC');
    const todayTime = iso8601Formatter(today, 'UTC');
    const timeForCalculate = dayjs(todayTime).diff(createdTime, 'minute');
    const days = Math.floor((timeForCalculate / 1440) % 365);
    const hours = Math.floor((timeForCalculate / 60) % 24);
    const minutes = Math.floor(timeForCalculate % 60);
    return `${days}d ${hours}h ${minutes}m`;
};
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const state = reactive({
    alertState: computed(() => alertPageState.alertData?.state),
    alertUrgency: computed(() => alertPageState.alertData?.urgency),
    reassignModalVisible: false,
    duration: computed(() => calculateTime(alertPageState.alertData?.created_at)),
    alertStateList: computed(() => ([
        { name: ALERT_STATE.TRIGGERED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.TRIGGERED') },
        { name: ALERT_STATE.ACKNOWLEDGED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.ACKNOWLEDGED') },
        { name: ALERT_STATE.RESOLVED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.RESOLVED') },
    ])),
    alertUrgencyList: computed(() => ([
        { name: ALERT_URGENCY.HIGH, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.HIGH') },
        { name: ALERT_URGENCY.LOW, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.LOW') },
    ])),
});

const onClickReassign = () => {
    state.reassignModalVisible = true;
};

const changeAlertState = async (alertState: AlertState) => {
    try {
        await alertPageStore.updateAlertData({
            updateParams: {
                state: alertState,
            },
            alertId: props.id,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_STATE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_URGENCY'));
    }
};

const changeAlertUrgency = async (alertUrgency: AlertUrgency) => {
    try {
        await alertPageStore.updateAlertData({
            updateParams: {
                urgency: alertUrgency,
            },
            alertId: props.id,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_URGENCY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_URGENCY'));
    }
};
</script>

<template>
    <p-pane-layout class="alert-detail-summary">
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
            <template v-if="state.alertState !== ALERT_STATE.ERROR">
                <p-select-dropdown
                    :menu="state.alertStateList"
                    :selected="state.alertState"
                    :disabled="!props.hasReadWriteAccess || props.manageDisabled"
                    class="state-dropdown"
                    @select="changeAlertState"
                >
                    <template #dropdown-button>
                        <span :class="{'text-alert': state.alertState === ALERT_STATE.TRIGGERED}">
                            {{ state.alertStateList.find(d => d.name === state.alertState).label }}
                        </span>
                    </template>
                </p-select-dropdown>
            </template>
            <template v-else>
                <p-badge style-type="alert"
                         badge-type="solid"
                         shape="square"
                >
                    {{ ALERT_STATE.ERROR }}
                </p-badge>
            </template>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.URGENCY') }}</span>
            <p-select-dropdown :menu="state.alertUrgencyList"
                               :selected="state.alertUrgency"
                               :disabled="!props.hasReadWriteAccess || (state.alertState === ALERT_STATE.ERROR || props.manageDisabled)"
                               class="state-dropdown"
                               @select="changeAlertUrgency"
            >
                <template #dropdown-button>
                    <span class="selected-urgency">
                        <p-i v-if="state.alertUrgency === ALERT_URGENCY.HIGH"
                             name="ic_error-filled"
                             width="1em"
                             height="1em"
                             class="mr-2"
                             :color="red[400]"
                        />
                        <p-i v-if="state.alertUrgency === ALERT_URGENCY.LOW"
                             name="ic_warning-filled"
                             width="1em"
                             height="1em"
                             class="mr-2"
                             :color="red[200]"
                        />
                        <span>{{ state.alertUrgencyList.find(d => d.name === state.alertUrgency).label }}</span>
                    </span>
                </template>
            </p-select-dropdown>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGNED_TO') }}
                <p-button style-type="tertiary"
                          size="sm"
                          class="ml-2"
                          :disabled="props.manageDisabled"
                          @click="onClickReassign"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGN') }}
                </p-button>
            </span>
            <span v-if="alertPageState.alertData?.assignee"
                  class="email"
            >{{ alertPageState.alertData?.assignee }}</span>
            <span v-else>--</span>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.DURATION') }}</span>
            <span class="time">{{ state.duration }}</span>
        </p>
        <alert-detail-summary-assign-modal
            :visible.sync="state.reassignModalVisible"
            :project-id="alertPageState.alertData?.project_id"
            :alert-id="props.id"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-summary {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 1rem;
    width: 100%;
    max-width: 100%;
    flex-wrap: wrap;
    .state-dropdown {
        width: 9rem;
        .text-alert, .selected-urgency {
            @apply flex items-center;
        }
    }

    @screen mobile {
        flex-wrap: wrap;
        gap: 1.5rem;
    }

    @screen tablet {
        flex-wrap: wrap;
        gap: 1.5rem;
        max-width: 100%;
    }
}
.content-wrapper {
    display: flex;
    flex-direction: column;
    min-width: 150px;
    width: 100%;
    max-width: calc(20% - 1rem);
    .title {
        @apply text-gray-500 font-bold;
        font-size: 0.75rem;
        line-height: 120%;
        margin-bottom: 0.5rem;
    }
    .email {
        @apply text-blue-900;
        font-size: 0.875rem;
        line-height: 155%;
    }
    .time {
        @apply font-bold;
        font-size: 1rem;
        line-height: 155%;
    }

    @screen mobile {
        width: 100%;
    }
}

</style>
