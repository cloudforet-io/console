<template>
    <p-pane-layout class="alert-detail-header">
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
            <p-select-dropdown v-model="alertState" :items="ALERT_STATE_LIST" :use-custom-style="true" />
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.URGENCY') }}</span>
            <p-select-dropdown v-model="alertUrgency" :items="ALERT_URGENCY_LIST" :use-custom-style="true" />
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGNED_TO') }}
                <p-button style-type="gray-border outline" size="sm" class="ml-2"
                          @click="onClickReassign"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.HEADER.REASSIGN') }}
                </p-button>
            </span>
            <span class="email">{{ alertData.assignee }}</span>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.DURATION') }}</span>
            <span class="time">{{ duration }}</span>
        </p>
        <alert-reassign-modal :visible.sync="reassignModalVisible" :project-id="alertData.project_id" />
    </p-pane-layout>
</template>

<script lang="ts">
import { PButton, PPaneLayout, PSelectDropdown } from '@spaceone/design-system';
import { reactive, toRefs, UnwrapRef } from '@vue/composition-api';
import { ALERT_STATE, ALERT_URGENCY, AlertDataModel } from '@/views/monitoring/alert/type';
import AlertReassignModal from '@/views/monitoring/alert/modules/alert-detail/AlertReassignModal.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TimeStamp } from '@/models';
import { iso8601Formatter } from '@/lib/util';

dayjs.extend(relativeTime);
dayjs.extend(utc);

interface HeaderState {
    alertState: ALERT_STATE;
    alertUrgency: ALERT_URGENCY;
    reassignModalVisible: boolean;
    duration: string;
}

const ALERT_STATE_LIST = Object.freeze([
    { label: 'Triggered', name: 'TRIGGERED', type: 'item' },
    { label: 'Acknowledged', name: 'ACKNOWLEDGED', type: 'item' },
    { label: 'Resolved', name: 'RESOLVED', type: 'item' },
]);

const ALERT_URGENCY_LIST = Object.freeze([
    { label: 'High', name: 'HIGH', type: 'item' },
    { label: 'Low', name: 'LOW', type: 'item' },
]);

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

const calculateTime = (time) => {
    const today = dayjs().toISOString();
    const targetTime = iso8601Formatter(time, 'UTC');
    const todayTime = iso8601Formatter(today, 'UTC');
    let calculatedTime = dayjs(todayTime).diff(targetTime);
    if (isNaN(calculatedTime)) calculatedTime = -1;
    return dayjs(calculatedTime).format('DD/HH:mm');
};

export default {
    name: 'AlertDetailHeader',
    components: {
        AlertReassignModal,
        PPaneLayout,
        PSelectDropdown,
        PButton,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
        alertData: {
            type: Object,
            default: null,
        },
    },
    setup(props: PropsType) {
        const state: UnwrapRef<HeaderState> = reactive({
            alertState: props.alertData.state,
            alertUrgency: props.alertData.urgency,
            reassignModalVisible: false,
            duration: calculateTime(props.alertData.created_at),
        });

        const onClickReassign = () => {
            state.reassignModalVisible = true;
        };

        return {
            ...toRefs(state),
            ALERT_STATE_LIST,
            ALERT_URGENCY_LIST,
            onClickReassign,
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
