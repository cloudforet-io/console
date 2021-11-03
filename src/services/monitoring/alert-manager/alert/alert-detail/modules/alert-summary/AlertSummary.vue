<template>
    <p-pane-layout class="alert-detail-header">
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
            <template v-if="alertState !== ALERT_STATE.ERROR">
                <p-select-dropdown
                    :items="alertStateList"
                    :selected="alertState"
                    class="state-dropdown"
                    @select="changeAlertState"
                >
                    <span :class="{'text-alert': alertState === ALERT_STATE.TRIGGERED}">
                        {{ alertStateList.find(d => d.name === alertState).label }}
                    </span>
                </p-select-dropdown>
            </template>
            <template v-else>
                <p-badge style-type="alert" shape="square">
                    {{ ALERT_STATE.ERROR }}
                </p-badge>
            </template>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.URGENCY') }}</span>
            <p-select-dropdown :items="alertUrgencyList"
                               :selected="alertUrgency"
                               :disabled="alertState === ALERT_STATE.ERROR"
                               class="state-dropdown"
                               @select="changeAlertUrgency"
            >
                <p-i v-if="alertUrgency === ALERT_URGENCY.HIGH" name="ic_alert" width="1em"
                     height="1em" class="mr-2"
                />
                <p-i v-if="alertUrgency === ALERT_URGENCY.LOW" name="ic_urgency_low" width="1em"
                     height="1em" class="mr-2"
                />
                <span>{{ alertUrgencyList.find(d => d.name === alertUrgency).label }}</span>
            </p-select-dropdown>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGNED_TO') }}
                <p-button style-type="gray-border" :outline="true" size="sm"
                          class="ml-2"
                          @click="onClickReassign"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGN') }}
                </p-button>
            </span>
            <span v-if="alertData.assignee" class="email">{{ alertData.assignee }}</span>
            <span v-else>--</span>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.DURATION') }}</span>
            <span class="time">{{ duration }}</span>
        </p>
        <alert-reassign-modal
            :visible.sync="reassignModalVisible" :project-id="alertData.project_id"
            :alert-id="id"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PButton, PPaneLayout, PSelectDropdown, PI, PBadge,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { AlertDataModel } from '@/services/monitoring/alert-manager/type';
import AlertReassignModal from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-summary/modules/AlertReassignModal.vue';
import dayjs from 'dayjs';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { ALERT_STATE, ALERT_URGENCY } from '@/services/monitoring/alert-manager/lib/config';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';


interface HeaderState {
    alertState: ALERT_STATE;
    alertUrgency: ALERT_URGENCY;
    reassignModalVisible: boolean;
    duration: string;
    alertStateList: MenuItem[];
    alertUrgencyList: MenuItem[];
}

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

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
        AlertReassignModal,
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
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: PropsType, { root }) {
        const state = reactive({
            alertInfo: computed(() => store.state.service.alert.alertData),
            alertState: computed(() => state.alertInfo?.state),
            alertUrgency: computed(() => state.alertInfo?.urgency),
            reassignModalVisible: false,
            duration: computed(() => calculateTime(state.alertInfo?.created_at)),
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

        const changeAlertState = async (alertState: ALERT_STATE) => {
            try {
                await store.dispatch('service/alert/updateAlertData', {
                    updateParams: {
                        state: alertState,
                    },
                    alertId: props.id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_STATE'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_STATE'), e, root);
            }
        };

        const changeAlertUrgency = async (alertUrgency: ALERT_URGENCY) => {
            try {
                await store.dispatch('service/alert/updateAlertData', {
                    updateParams: {
                        urgency: alertUrgency,
                    },
                    alertId: props.id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_UPDATE_URGENCY'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_UPDATE_URGENCY'), e, root);
            }
        };

        return {
            ...toRefs(state),
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
