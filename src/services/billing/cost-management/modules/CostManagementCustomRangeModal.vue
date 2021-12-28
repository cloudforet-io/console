<template>
    <p-button-modal
        :header-title="headerTitle"
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
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.FROM')"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="datetimePickerDataType" :selected-dates.sync="startDate"
                                   :min-date="minDate" :max-date="maxDate"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="datetimePickerDataType" :selected-dates.sync="endDate"
                                   :min-date="minDate" :max-date="maxDate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';

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
        headerTitle: {
            type: String,
            default: '',
        },
        datetimePickerDataType: {
            type: String,
            default: DATA_TYPE.yearToDate,
        },
        minDate: {
            type: String,
            default: undefined,
        },
        maxDate: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: computed({
                get() { return props.visible; },
                set(val) { emit('update:visible', val); },
            }),
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

<style scoped lang="postcss">
.period-select {
    .datetime-picker {
        width: 100%;
    }
}
</style>
