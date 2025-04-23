<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PI, PTextInput, PTooltip, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import {
    widgetValidatorRegistry,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { SankeyDimensionsOptions, SankeyDimensionsValue } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';




const FIELD_COUNT = 2;
const FIELD_KEY = 'sankeyDimensions';
const props = defineProps<WidgetFieldComponentProps<SankeyDimensionsOptions>>();

const validator = widgetValidatorRegistry[FIELD_KEY];

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
    fieldValue: computed<SankeyDimensionsValue>(() => props.fieldManager.data[FIELD_KEY].value),
    max: computed<number|undefined>(() => props.widgetFieldSchema?.options?.max),
    menuItems: computed<SelectDropdownMenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!state.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(state.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    selectedItem: computed<MenuItem[]|string|undefined>(() => {
        if (!state.menuItems.length) return [];
        return state.menuItems.filter((d) => state.fieldValue.data?.includes(d.name));
    }),
    isValid: computed<boolean>(() => validator(state.fieldValue, props.widgetConfig, state.selectedDataTable)),
    isMaxValid: computed<boolean>(() => state.fieldValue?.count <= state.max),
    tooltipDesc: computed<TranslateResult>(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DIMENSIONS'),
        max: state.max,
    })),
});

/* Event */
const handleSelectAxis = (val: SelectDropdownMenuItem) => {
    if (state.fieldValue.data?.includes(val.name)) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            ...state.fieldValue,
            data: state.fieldValue.data?.filter((item) => item !== val.name),
        });
        return;
    }
    if (state.fieldValue.data?.length >= FIELD_COUNT) {
        showErrorMessage(i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DIMENSIONS_WARNING'), '');
        props.fieldManager.setFieldValue(FIELD_KEY, state.fieldValue);
        return;
    }
    props.fieldManager.setFieldValue(FIELD_KEY, {
        ...state.fieldValue,
        data: [...state.fieldValue.data, val.name],
    });
};
const handleUpdateCount = (val: number) => {
    if (val === state.fieldValue.count) return;
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, count: val });
};

</script>

<template>
    <div class="widget-field-x-axis">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DIMENSIONS')"
                       required
        >
            <div class="field-form-wrapper">
                <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                               style-type="secondary"
                               required
                               class="w-full"
                >
                    <p-select-dropdown :menu="state.menuItems"
                                       :selected="state.selectedItem"
                                       :invalid="!state.isValid"
                                       multi-selectable
                                       show-select-marker
                                       block
                                       @select="handleSelectAxis"
                    />
                </p-field-group>
                <p-field-group :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
                               style-type="secondary"
                               class="max-items"
                               :invalid="!state.isMaxValid"
                               :invalid-text="$t('COMMON.WIDGETS.NUMBER_FIELD_VALIDATION', {max: state.max})"
                               required
                >
                    <p-text-input type="number"
                                  :min="1"
                                  :max="state.max || 9999"
                                  :invalid="!state.isMaxValid"
                                  :value="state.fieldValue?.count"
                                  @update:value="handleUpdateCount"
                    />
                    <template #label-extra>
                        <p-tooltip v-if="state.max"
                                   :contents="state.tooltipDesc"
                                   position="bottom"
                                   class="tooltip"
                        >
                            <p-i width="1rem"
                                 height="1rem"
                                 name="ic_info-circle"
                                 class="icon"
                            />
                        </p-tooltip>
                    </template>
                </p-field-group>
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.field-form-wrapper {
    display: flex;
    gap: 0.5rem;

    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 6.5rem;
        .input-container {
            padding-right: 1.5rem;
        }
    }
    .max-items {
        width: 10rem;

        .tooltip {
            position: relative;
            padding-left: 1.25rem;
            .icon {
                position: absolute;
                right: 0;
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
