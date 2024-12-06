<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import {
    PPaneLayout, PSelectDropdown, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { AlertState, AlertUrgency } from '@/schema/monitoring/alert/type';
import { i18n } from '@/translations';

import { red } from '@/styles/colors';

import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';

const calculateTime = (time):string => {
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
    alertState: 'TRIGGERED',
    alertUrgency: 'HIGH',
    reassignModalVisible: false,
    duration: computed<string>(() => calculateTime(alertPageState.alertData?.created_at)),
    alertStateList: computed<SelectDropdownMenuItem[]>(() => ([
        { name: ALERT_STATE.TRIGGERED, label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED') },
        { name: ALERT_STATE.ACKNOWLEDGED, label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED') },
        { name: ALERT_STATE.RESOLVED, label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED') },
    ])),
    alertUrgencyList: computed<SelectDropdownMenuItem[]>(() => ([
        { name: ALERT_URGENCY.HIGH, label: i18n.t('ALERT_MANAGER.ALERTS.HIGH') },
        { name: ALERT_URGENCY.LOW, label: i18n.t('ALERT_MANAGER.ALERTS.LOW') },
    ])),
});

const handleChangeAlertState = async (alertState: AlertState) => {
    console.log('TODO: handleChangeAlertState', alertState);
};

const handleChangeAlertUrgency = async (alertUrgency: AlertUrgency) => {
    console.log('TODO: changeAlertUrgency', alertUrgency);
};
</script>

<template>
    <p-pane-layout class="alert-detail-summary flex flex-wrap gap-4 w-full">
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.LABEL_STATE') }}</span>
            <p-select-dropdown
                :menu="state.alertStateList"
                :selected="state.alertState"
                class="state-dropdown"
                @select="handleChangeAlertState"
            >
                <template #dropdown-button>
                    <span :class="{'text-alert': state.alertState === ALERT_STATE.TRIGGERED}">
                        {{ state.alertStateList.find(d => d.name === state.alertState).label }}
                    </span>
                </template>
            </p-select-dropdown>
        </div>
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') }}</span>
            <p-select-dropdown :menu="state.alertUrgencyList"
                               :selected="state.alertUrgency"
                               :disabled="(state.alertState === ALERT_STATE.ERROR || props.manageDisabled)"
                               class="state-dropdown"
                               @select="handleChangeAlertUrgency"
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
        </div>
        <div class="content-wrapper">
            <span class="title">{{ $t('ALERT_MANAGER.ALERTS.DURATION') }}</span>
            <span class="text-label-lg font-bold leading-8">{{ state.duration }}</span>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-summary {
    padding: 1.5rem 1rem;
    .content-wrapper {
        @apply flex flex-col flex-1;
        min-width: 150px;
        .title {
            @apply text-label-sm text-gray-500 font-bold mb-1;
        }
        .state-dropdown {
            width: 9rem;
            .text-alert, .selected-urgency {
                @apply flex items-center;
            }
        }
    }

    @screen mobile {
        flex-wrap: wrap;
        gap: 1.5rem;
        .content-wrapper {
            width: 100%;
        }
    }

    @screen tablet {
        flex-wrap: wrap;
        gap: 1.5rem;
        max-width: 100%;
    }
}

</style>
