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
                <p-button style-type="gray-border outline" size="sm" class="ml-2">
                    {{ $t('MONITORING.ALERT.DETAIL.HEADER.REASSIGN') }}
                </p-button>
            </span>
            <span class="email">mz.co.kr</span>
        </p>
        <p class="content-wrapper">
            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.DURATION') }}</span>
            <span class="time">23h 24m</span>
        </p>
    </p-pane-layout>
</template>

<script lang="ts">
import { PButton, PPaneLayout, PSelectDropdown } from '@spaceone/design-system';
import { reactive, toRefs, UnwrapRef } from '@vue/composition-api';
import { ALERT_STATE, ALERT_URGENCY } from '@/views/monitoring/alert/type';

interface HeaderState {
    alertState: ALERT_STATE;
    alertUrgency: ALERT_URGENCY;
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

export default {
    name: 'AlertDetailHeader',
    components: {
        PPaneLayout,
        PSelectDropdown,
        PButton,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const state: UnwrapRef<HeaderState> = reactive({
            alertState: ALERT_STATE.TRIGGERED,
            alertUrgency: ALERT_URGENCY.HIGH,
        });

        return {
            ...toRefs(state),
            ALERT_STATE_LIST,
            ALERT_URGENCY_LIST,
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
