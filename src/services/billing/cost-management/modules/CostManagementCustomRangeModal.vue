<template>
    <p-button-modal
        :header-title="headerTitle"
        centered
        size="sm"
        fade
        :scrollable="false"
        backdrop
        :visible.sync="proxyVisible"
        :disabled="invalid"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.FROM')"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="datetimePickerDataType" :selected-dates.sync="startDate"
                                   :invalid="!!startDate.length && !!endDate.length && invalid"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="datetimePickerDataType" :selected-dates.sync="endDate"
                                   :invalid="!!startDate.length && !!endDate.length && invalid"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';
import dayjs from 'dayjs';


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
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: computed({
                get() { return props.visible; },
                set(val) { emit('update:visible', val); },
            }),
            invalid: computed(() => {
                if (!state.startDate.length || !state.endDate.length) return true;
                const timeUnit = props.datetimePickerDataType === DATA_TYPE.yearToDate ? 'day' : 'month';
                const startDate = dayjs.utc(state.startDate[0]);
                const endDate = dayjs.utc(state.endDate[0]);

                if (props.datetimePickerDataType === DATA_TYPE.yearToMonth && endDate.diff(startDate, 'year') >= 1) return true;
                return startDate.isAfter(endDate, timeUnit);
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
