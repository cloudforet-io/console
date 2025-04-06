<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown, PFieldGroup, PTextInput, PTooltip, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import {
    widgetValidatorRegistry,
} from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type {
    GroupByOptions,
    GroupByValue,
} from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const DEFAULT_COUNT = 5;
const FIELD_KEY = 'groupBy';

const props = defineProps<WidgetFieldComponentProps<GroupByOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const validator = widgetValidatorRegistry[FIELD_KEY];

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    isInitiated: false,
    fieldValue: computed<GroupByValue>(() => props.fieldManager.data[FIELD_KEY].value),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!state.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(state.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    multiselectable: computed(() => props.widgetFieldSchema?.options?.multiSelectable),
    hideCount: computed(() => props.widgetFieldSchema?.options?.hideCount),
    fixedValue: computed(() => props.widgetFieldSchema?.options?.fixedValue),
    fieldName: computed(() => i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.GROUP_BY')),
    selectedItem: computed<MenuItem[]|string|undefined>(() => {
        if (!state.menuItems.length) {
            return state.multiselectable ? [] : undefined;
        }
        if (state.fixedValue) return state.fixedValue;
        if (state.multiselectable) {
            return state.fieldValue.data?.map((d) => {
                const validMenuItem = state.menuItems.find((item) => item.name === d);
                return validMenuItem || { name: d, label: d };
            }) || [];
        }
        return state.fieldValue.data;
    }),
    isValid: computed(() => validator(state.fieldValue, props.widgetConfig, state.selectedDataTable)),
    max: computed(() => props.widgetFieldSchema?.options?.max),
    isMaxValid: computed<boolean>(() => (state.max ? ((state.fieldValue?.count ?? DEFAULT_COUNT) <= state.max) : true)),
    tooltipDesc: computed(() => i18n.t('COMMON.WIDGETS.MAX_ITEMS_DESC', {
        fieldName: state.fieldName,
        max: state.max,
    })),
});

/* Event */
const handleUpdateSelect = (val: string|MenuItem[]) => {
    if (!val) return;
    if (state.multiselectable && Array.isArray(val)) {
        props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, data: val.map((item) => item.name) });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, data: val });
    }
};
const handleUpdateCount = (val: number) => {
    if (val === state.fieldValue.count) return;
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, count: val });
};

</script>

<template>
    <div class="widget-field-group-by">
        <p-field-group :label="state.fieldName"
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
                                       :multi-selectable="state.multiselectable"
                                       :show-select-marker="state.multiselectable"
                                       :invalid="!state.isValid"
                                       :disabled="!!state.fixedValue"
                                       appearance-type="badge"
                                       block
                                       @update:selected="handleUpdateSelect"
                    />
                </p-field-group>
                <p-field-group v-if="!state.hideCount"
                               :label="$t('COMMON.WIDGETS.MAX_ITEMS')"
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

<style lang="postcss" scoped>
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
