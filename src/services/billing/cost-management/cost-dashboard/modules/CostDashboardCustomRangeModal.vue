<template>
    <p-button-modal
        header-title="Custom Range"
        centered
        size="sm"
        fade
        :scrollable="false"
        backdrop
        :visible.sync="proxyVisible"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group class="period-select"
                           label="From"
                           required
            >
                <p-datetime-picker data-type="yearToMonth" :selected-dates.sync="startDate" />
            </p-field-group>
            <p-field-group class="period-select"
                           label="To"
                           required
            >
                <p-datetime-picker data-type="yearToMonth" :selected-dates.sync="endDate" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/helper/composition-helpers';

export default {
    name: 'CostDashboardCustomRangeModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PDatetimePicker,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            startDate: [],
            endDate: [],
        });
        const handleConfirm = () => {
            state.proxyVisible = false;
            const period = {
                start: state.startDate[0],
                end: state.endDate[0],
            };
            emit('confirm', period);
        };

        return {
            ...toRefs(state),
            handleConfirm,
        };
    },
};
</script>
