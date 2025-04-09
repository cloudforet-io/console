<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PToggleButton, PI, PTooltip, PCheckbox,
} from '@cloudforet/mirinae';

import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { SubTotalOptions, SubTotalValue } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const FIELD_KEY = 'subTotal';

const props = defineProps<WidgetFieldComponentProps<SubTotalOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    isPivotDataTable: computed<boolean>(() => state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    fieldValue: computed<SubTotalValue>(() => props.fieldManager.data[FIELD_KEY].value),
    disabled: computed(() => false),
});

const handleUpdateValue = (value: boolean) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        freeze: value,
    });
};
const handleUpdateToggle = (value: boolean) => {
    if (value) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: true,
            freeze: true,
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            toggleValue: false,
        });
    }
};

</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>
                {{ $t('COMMON.WIDGETS.SUB_TOTAL.SUB_TOTAL') }}
                <p-tooltip :contents="$t('COMMON.WIDGETS.SUB_TOTAL.INFO_TEXT')">
                    <p-i name="ic_info-circle"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </p-tooltip>
            </p-field-title>
            <p-toggle-button :value="state.fieldValue?.toggleValue"
                             :disabled="!state.isPivotDataTable"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.fieldValue?.toggleValue"
             class="contents"
        >
            <p-checkbox :selected="state.fieldValue?.freeze"
                        @change="handleUpdateValue"
            >
                {{ $t('COMMON.WIDGETS.TOTAL.SUB_TOTAL_DESC') }}
            </p-checkbox>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents {
        @apply flex gap-2;
        margin-top: 0.5rem;
    }
}
</style>
