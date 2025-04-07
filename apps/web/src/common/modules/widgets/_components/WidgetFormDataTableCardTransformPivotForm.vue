<script setup lang="ts">
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PDivider, PFieldGroup, PSelectButton, PTextInput, PSelectDropdown, PRadioGroup, PRadio, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_TABLE_OPERATOR, DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { PivotOptions } from '@/common/modules/widgets/types/widget-model';


const props = defineProps<TransformDataTableProps<PivotOptions>>();

const emit = defineEmits<{(e: 'update:operator-options', value: PivotOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
    api,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const fieldsInfo = ref<PivotOptions['fields']>(props.originData.fields);
const selectInfo = ref<PivotOptions['select']>(props.originData.select);
const limitInfo = ref<PivotOptions['limit']>(props.originData.limit);
const functionInfo = ref<PivotOptions['function']>(props.originData.function);
const orderByInfo = ref<PivotOptions['order_by']>(props.originData.order_by);

const state = reactive({
    isInitiated: true,
    proxyOperatorOptions: useProxyValue<PivotOptions>('operatorOptions', props, emit),
    selectedDataTable: computed(() => dataTableList.value.find((dataTable) => dataTable.data_table_id === dataTableInfo.value.dataTableId)),
    labelFieldItems: computed<MenuItem[]>(() => {
        if (!state.selectedDataTable) return [];
        const labelsInfo = state.selectedDataTable.labels_info;
        return Object.keys(labelsInfo).map((key) => ({
            name: key,
            label: key,
        }));
    }),
    dataFieldItems: computed<MenuItem[]>(() => {
        if (!state.selectedDataTable) return [];
        const dataInfo = state.selectedDataTable.data_info;
        return Object.keys(dataInfo).map((key) => ({
            name: key,
            label: key,
        }));
    }),
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions.data_table_id) return true;
        if (!state.proxyOperatorOptions.fields?.column) return true;
        if (!state.proxyOperatorOptions.fields?.data) return true;
        if (!state.proxyOperatorOptions.select?.length && !state.proxyOperatorOptions.limit && state.proxyOperatorOptions?.fields?.column !== 'Date') return true;
        return false;
    }),
    columnFieldInvalid: computed<boolean>(() => {
        if (!state.labelFieldItems.length) return true;
        return false;
    }),
    valueTypeItems: computed<MenuItem[]>(() => [
        {
            name: 'auto',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.AUTO'),
        },
        {
            name: 'fixed',
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FIXED'),
        },
    ]),
    selectedValueType: 'auto',
    dynamicFieldItems: [] as MenuItem[],
    selectedDynamicFieldMenuItems: computed(() => {
        if (!selectInfo.value) return [];
        return selectInfo.value.map((item) => ({
            name: item,
            label: item,
        }));
    }),
    dynamicFieldLoading: false,
    operatorItems: computed<MenuItem[]>(() => [
        { name: 'sum', label: i18n.t('Sum') },
        { name: 'min', label: i18n.t('Min') },
        { name: 'max', label: i18n.t('Max') },
    ]),
    orderByTypeItems: computed<MenuItem[]>(() => [
        { name: 'key', label: i18n.t('Key') },
        { name: 'value', label: i18n.t('Value') },
    ]),
    orderByDescItems: computed(() => [
        { label: i18n.t('Ascending'), value: 'asc', icon: 'ic_sort-ascending' },
        { label: i18n.t('Descending'), value: 'desc', icon: 'ic_sort-descending' },
    ]),
    selectedOrderByDesc: computed(() => (orderByInfo.value?.desc ? 'desc' : 'asc')),
});
/* Events */
const handleUpdateCriteria = (value: string) => {
    fieldsInfo.value = {
        ...fieldsInfo.value,
        data: value,
    };
};
const handleUpdateColumn = (value: string) => {
    const labelKeys = Object.keys(state.selectedDataTable.labels_info ?? {});
    fieldsInfo.value = {
        ...fieldsInfo.value,
        column: value,
        labels: labelKeys.filter((key) => key !== value),
    };
    state.selectedValueType = 'auto';
    if (value === 'Date') {
        selectInfo.value = undefined;
        limitInfo.value = undefined;
    } else if (state.selectedValueType === 'auto') {
        limitInfo.value = DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT.limit;
    }
};

const handleChangeValueType = (value: string) => {
    if (value === state.selectedValueType) return;
    state.selectedValueType = value;
    if (value === 'auto') {
        selectInfo.value = undefined;
        limitInfo.value = fieldsInfo.value?.column === 'Date' ? undefined : DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT.limit;
    } else {
        selectInfo.value = [];
        limitInfo.value = undefined;
    }
};

const handleSelectDynamicFields = (value?: MenuItem[]) => {
    selectInfo.value = value?.map((item) => item.name as string) ?? [];
};
const handleUpdateLimit = (value: string) => {
    limitInfo.value = parseInt(value);
};
const handleUpdateOperator = (value: PivotOptions['function']) => {
    functionInfo.value = value;
};
const handleUpdateOrderByType = (value: 'key' | 'value') => {
    orderByInfo.value = {
        ...(orderByInfo.value ?? {}),
        type: value,
    };
};
const handleUpdateOrderByDesc = (value: 'asc' | 'desc') => {
    const desc = value === 'desc';
    orderByInfo.value = {
        ...(orderByInfo.value ?? {}),
        desc,
    };
};

/* Dynamic Field Fetching */
const fetchAndExtractDynamicField = async () => {
    if (!dataTableInfo.value?.dataTableId || !fieldsInfo.value?.column) return;
    const _isPrivate = dataTableInfo.value?.dataTableId.startsWith('private');
    const _fetcher = _isPrivate
        ? api.privateDataTableAPI.load
        : api.publicDataTableAPI.load;
    try {
        state.dynamicFieldLoading = true;
        const res = await _fetcher({
            data_table_id: dataTableInfo.value?.dataTableId,
            granularity: GRANULARITY.YEARLY,
        });
        const dynamicFields = getUniqueValues(res.results || [], fieldsInfo.value?.column);
        state.dynamicFieldItems = dynamicFields.map((field) => ({
            name: field,
            label: field,
        }));
    } catch (e) {
        showErrorMessage(e, '');
    } finally {
        state.dynamicFieldLoading = false;
    }
};

const getUniqueValues = (data: Record<string, string>[], key: string): string[] => {
    const values = data.map((item) => item[key]);
    return Array.from(new Set(values));
};

// Reset with changing data table
watch([dataTableInfo, () => state.selectedDataTable], ([_dataTableInfo]) => {
    if (_dataTableInfo.dataTableId) {
        const defaultData = cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT);
        state.selectedValueType = 'auto';
        fieldsInfo.value = defaultData.fields;
        selectInfo.value = defaultData.select;
        limitInfo.value = defaultData.limit;
        functionInfo.value = defaultData.function as PivotOptions['function'];
        orderByInfo.value = defaultData.order_by as PivotOptions['order_by'];
    }
});

// Fetching dynamic data for fixed column
watch([
    fieldsInfo,
    () => state.selectedValueType,
], ([fields, valueType]) => {
    if (!!fields?.column && valueType === 'fixed') {
        fetchAndExtractDynamicField();
    }
});

// Update operator options
watch([
    dataTableInfo, fieldsInfo, selectInfo,
    limitInfo, functionInfo, orderByInfo,
], ([_dataTableInfo, _fields, _select, _limit, _function, _orderBy]) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        fields: _fields,
        select: _select,
        limit: _limit,
        function: _function,
        order_by: _orderBy,
    };
});
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });

onMounted(() => {
    if (props.originData?.fields?.column === 'Date') {
        state.selectedValueType = 'auto';
    } else {
        state.selectedValueType = props.originData.limit !== undefined ? 'auto' : 'fixed';
    }
});

</script>

<template>
    <div class="widget-form-data-table-card-transform-pivot-form">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.PIVOT"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <div class="pivot-form">
                <p-field-group :label="$t('COMMON.WIDGETS.CRITERIA')"
                               style-type="secondary"
                               required
                               class="criteria-field"
                >
                    <p-select-dropdown :menu="state.dataFieldItems"
                                       :selected="fieldsInfo?.data"
                                       appearance-type="badge"
                                       block
                                       @update:selected="handleUpdateCriteria"
                    />
                </p-field-group>
                <p-field-group :label="$t('COMMON.WIDGETS.FIELD')"
                               style-type="secondary"
                               required
                               class="w-full"
                >
                    <div class="field-contents-wrapper">
                        <p-select-dropdown :menu="state.labelFieldItems"
                                           :selected="fieldsInfo?.column"
                                           appearance-type="badge"
                                           is-fixed-width
                                           :invalid="state.columnFieldInvalid"
                                           :disabled="state.columnFieldInvalid"
                                           block
                                           @update:selected="handleUpdateColumn"
                        />
                        <p-divider vertical />
                        <p-select-button v-for="selectItem in state.valueTypeItems"
                                         :key="`select-button-${selectItem.name}`"
                                         class="value-type-button"
                                         :value="selectItem.name"
                                         :disabled="selectItem.name === 'fixed' && fieldsInfo?.column === 'Date'"
                                         style-type="secondary"
                                         :selected="state.selectedValueType"
                                         block
                                         @change="handleChangeValueType"
                        >
                            {{ selectItem.label }}
                        </p-select-button>
                    </div>
                </p-field-group>
                <p-field-group required>
                    <div class="dynamic-field-value-contents-wrapper">
                        <p-select-dropdown v-if="state.selectedValueType === 'fixed'"
                                           class="dynamic-field-select-dropdown"
                                           :menu="state.dynamicFieldItems"
                                           :selected="state.selectedDynamicFieldMenuItems"
                                           :loading="state.dynamicFieldLoading"
                                           :invalid="!state.selectedDynamicFieldMenuItems.length"
                                           use-fixed-menu-style
                                           multi-selectable
                                           appearance-type="badge"
                                           show-select-marker
                                           show-clear-selection
                                           block
                                           @update:selected="handleSelectDynamicFields"
                                           @clear-selection="handleSelectDynamicFields([])"
                        />
                        <p-text-input v-else-if="state.proxyOperatorOptions.fields?.column !== 'Date'"
                                      type="number"
                                      class="dynamic-field-auto-count"
                                      :min="1"
                                      :max="15"
                                      :placeholder="$t('COMMON.WIDGETS.MAX_ITEMS')"
                                      :invalid="!limitInfo"
                                      :value="limitInfo"
                                      block
                                      @update:value="handleUpdateLimit"
                        />
                    </div>
                </p-field-group>
                <p-field-group :label="$t('Operator')"
                               style-type="secondary"
                               required
                               class="operator-field"
                >
                    <p-select-dropdown :menu="state.operatorItems"
                                       :selected="functionInfo"
                                       appearance-type="badge"
                                       block
                                       @update:selected="handleUpdateOperator"
                    />
                </p-field-group>
                <p-field-group :label="$t('Order by')"
                               style-type="secondary"
                               required
                               class="order-by-field  flex flex-col gap-2"
                >
                    <p-select-dropdown :menu="state.orderByTypeItems"
                                       :selected="orderByInfo?.type"
                                       appearance-type="badge"
                                       block
                                       @update:selected="handleUpdateOrderByType"
                    />
                    <p-radio-group direction="horizontal">
                        <p-radio v-for="(item) in state.orderByDescItems"
                                 :key="`order-by-${item.value}`"
                                 :value="item.value"
                                 :selected="state.selectedOrderByDesc"
                                 @change="handleUpdateOrderByDesc"
                        >
                            <div class="desc-item">
                                <p-i :name="item.icon"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <span>
                                    {{ item.label }}
                                </span>
                            </div>
                        </p-radio>
                    </p-radio-group>
                </p-field-group>
            </div>
        </widget-form-data-table-card-transform-form-wrapper>
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-transform-pivot-form {

    .pivot-form {
        .field-contents-wrapper {
            @apply flex gap-2;

            .value-type-button {
                height: 2rem;
                padding: 0 1rem;
            }
        }
        .dynamic-field-value-contents-wrapper {
            margin-top: 0.5rem;

            .dynamic-field-auto-count {
                height: 2rem;
            }
        }

        .desc-item {
            @apply inline-flex items-center;
            gap: 0.0625rem;
            padding-left: 0.25rem;
        }
    }
}
</style>
