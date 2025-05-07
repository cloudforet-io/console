<script lang="ts" setup>
import { reactive } from 'vue';

import dayjs from 'dayjs';

import { PButtonModal, PDatetimePicker } from '@cloudforet/mirinae';

interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:month-range', value: [string, string]): void;
  (e: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    startMonth: [],
    endMonth: [],
});

const handleConfirm = () => {
    emit('update:month-range', [state.startMonth[0], state.endMonth[0]]);
    emit('update:visible', false);
};

const handleClose = () => {
    state.startMonth = [];
    state.endMonth = [];
    emit('update:visible', false);
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #header-title>
            <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SELECT_MONTH') }}</span>
        </template>
        <template #body>
            <div class="flex items-center gap-2 mb-4">
                <div class="flex flex-col gap-1">
                    <span class="font-bold">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTH') }}</span>
                    <p-datetime-picker data-type="yearToMonth"
                                       :selected-dates.sync="state.startMonth"
                                       :max-date="dayjs.utc().format('YYYY-MM')"
                                       :placeholder="String($t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SELECT_MONTH'))"
                    />
                </div>
                <span>~</span>
                <div class="flex flex-col gap-1">
                    <span class="font-bold">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTH') }}</span>
                    <p-datetime-picker data-type="yearToMonth"
                                       :selected-dates.sync="state.endMonth"
                                       :max-date="dayjs.utc().format('YYYY-MM')"
                                       :placeholder="String($t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SELECT_MONTH'))"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
:deep(.p-datetime-picker) {
    width: 12rem;
}
</style>
