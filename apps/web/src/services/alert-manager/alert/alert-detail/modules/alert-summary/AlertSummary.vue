<template>
    <p-pane-layout class="alert-detail-header">
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
            <template v-if="alertState !== ALERT_STATE.ERROR">
                <p-select-dropdown
                    :items="alertStateList"
                    :selected="alertState"
                    :disabled="manageDisabled"
                    class="state-dropdown"
                    @select="changeAlertState"
                >
                    <span :class="{'text-alert': alertState === ALERT_STATE.TRIGGERED}">
                        {{ alertStateList.find(d => d.name === alertState).label }}
                    </span>
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
            <p-select-dropdown :items="alertUrgencyList"
                               :selected="alertUrgency"
                               :disabled="alertState === ALERT_STATE.ERROR || manageDisabled"
                               class="state-dropdown"
                               @select="changeAlertUrgency"
            >
                <p-i v-if="alertUrgency === ALERT_URGENCY.HIGH"
                     name="ic_error-filled"
                     width="1em"
                     height="1em"
                     class="mr-2"
                />
                <p-i v-if="alertUrgency === ALERT_URGENCY.LOW"
                     name="ic_warning-filled"
                     width="1em"
                     height="1em"
                     class="mr-2"
                />
                <span>{{ alertUrgencyList.find(d => d.name === alertUrgency).label }}</span>
            </p-select-dropdown>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGNED_TO') }}
                <p-button style-type="tertiary"
                          size="sm"
                          class="ml-2"
                          :disabled="manageDisabled"
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
            <span class="time">{{ duration }}</span>
        </p>
        <alert-assign-modal
            :visible.sync="reassignModalVisible"
            :project-id="alertPageState.alertData?.project_id"
            :alert-id="id"
        />
    </p-pane-layout>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PButton, PPaneLayout, PSelectDropdown, PI, PBadge,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/core-lib';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertAssignModal from '@/services/alert-manager/alert/alert-detail/modules/alert-summary/modules/AlertAssignModal.vue';
import type { AlertState, AlertUrgency } from '@/services/alert-manager/lib/config';
import {
    ALERT_STATE, ALERT_URGENCY,
} from '@/services/alert-manager/lib/config';
import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';


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

export default {
    name: 'AlertSummary',
    components: {
        AlertAssignModal,
        PPaneLayout,
        PSelectDropdown,
        PButton,
        PI,
        PBadge,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const alertPageStore = useAlertPageStore();
        const alertPageState = alertPageStore.$state;

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

        return {
            ...toRefs(state),
            alertPageState,
            ALERT_STATE,
            ALERT_URGENCY,
            onClickReassign,
            changeAlertState,
            changeAlertUrgency,
        };
    },
};

</script>

<style lang="postcss" scoped>
.alert-detail-header {
    display: flex;
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    .state-dropdown {
        width: 9rem;
    }

    @screen mobile {
        flex-wrap: wrap;
        gap: 1.5rem;
    }

    @screen tablet {
        flex-wrap: wrap;
        gap: 1.5rem;
    }
}
.content-wrapper {
    width: 40%;
    display: flex;
    flex-direction: column;

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
