<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PFieldGroup, PSelectButton, PTextInput, PSelectDropdown, PRadioGroup, PRadio, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DataTableLoadParameters } from '@/schema/dashboard/public-data-table/api-verbs/load';
import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import {
    type DATA_TABLE_OPERATOR, DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo } from '@/common/modules/widgets/types/widget-data-table-type';
import type { PivotOptions } from '@/common/modules/widgets/types/widget-model';




interface Props {
    dataTableId: string;
    dataTableInfo: TransformDataTableInfo;
    formData: Omit<PivotOptions, 'dataTableId'>;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:form-data', value: Omit<PivotOptions, 'dataTableId'>): void;
    (e: 'update:data-table-info', value: TransformDataTableInfo): void;
}>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
});
const state = reactive({
    isInitiated: true,
    proxyDataTableInfo: useProxyValue<TransformDataTableInfo>('dataTableInfo', props, emit),
    proxyFormData: useProxyValue<Omit<PivotOptions, 'dataTableId'>>('formData', props, emit),
    selectedDataTable: computed(() => storeState.dataTables.find((dataTable) => dataTable.data_table_id === state.proxyDataTableInfo.dataTableId)),
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
    columnFieldInvalid: computed<boolean>(() => {
        if (state.labelFieldItems.length === 1) return true;
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
        if (!state.proxyFormData.select) return [];
        return state.proxyFormData.select.map((item) => ({
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
    selectedOrderByDesc: computed(() => (state.proxyFormData.order_by?.desc ? 'desc' : 'asc')),
});
/* Events */
const handleUpdateCriteria = (value: string) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        fields: {
            ...state.proxyFormData.fields,
            data: value,
        },
    };
};
const handleUpdateColumn = (value: string) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        fields: {
            ...state.proxyFormData.fields,
            column: value,
        },
    };
};

const handleChangeValueType = (value: string) => {
    state.selectedValueType = value;
    if (value === 'auto') {
        state.proxyFormData = {
            ...state.proxyFormData,
            select: undefined,
            limit: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT.limit,
        };
    } else {
        state.proxyFormData = {
            ...state.proxyFormData,
            select: [],
            limit: undefined,
        };
    }
};

const handleSelectDynamicFields = (value: MenuItem[]) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        select: value.map((item) => item.name),
    };
};
const handleUpdateLimit = (value: string) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        limit: value,
    };
};
const handleUpdateOperator = (value: PivotOptions['functions']) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        functions: value,
    };
};
const handleUpdateOrderByType = (value: PivotOptions['order_by']['type']) => {
    state.proxyFormData = {
        ...state.proxyFormData,
        order_by: {
            ...state.proxyFormData.order_by,
            type: value,
        },
    };
};
const handleUpdateOrderByDesc = (value: 'asc' | 'desc') => {
    const desc = value === 'desc';
    state.proxyFormData = {
        ...state.proxyFormData,
        order_by: {
            ...state.proxyFormData.order_by,
            desc,
        },
    };
};

/* Dynamic Field Fetching */
const fetchAndExtractDynamicField = async () => {
    if (!state.proxyDataTableInfo.dataTableId || !state.proxyFormData.fields?.column) return;
    const _isPrivate = state.proxyDataTableInfo.dataTableId.startsWith('private');
    const _fetcher = _isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.load<DataTableLoadParameters, ListResponse<Record<string, string>>>
        : SpaceConnector.clientV2.dashboard.publicDataTable.load<DataTableLoadParameters, ListResponse<Record<string, string>>>;
    try {
        state.dynamicFieldLoading = true;
        const res = await _fetcher({
            data_table_id: state.proxyDataTableInfo.dataTableId,
            granularity: GRANULARITY.YEARLY,
        });
        const dynamicFields = getUniqueValues(res.results || [], state.proxyFormData.fields.column);
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

watch(() => props.formData, (formData) => {
    if (state.isInitiated) {
        state.selectedValueType = formData.limit !== undefined ? 'auto' : 'fixed';
        state.isInitiated = false;
    }
});

watch(() => state.proxyDataTableInfo, (dataTableInfo) => {
    const dataTableId = dataTableInfo.dataTableId;
    if (dataTableId) {
        state.selectedValueType = 'auto';
        state.proxyFormData = DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT;
    }
});

// Fetching dynamic data for fixed column
watch([
    () => state.proxyFormData.fields?.column,
    () => state.selectedValueType,
], ([column, valueType]) => {
    if (!!column && valueType === 'fixed') {
        fetchAndExtractDynamicField();
    }
});

</script>

<template>
    <div class="widget-form-data-table-card-transform-pivot-form">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.dataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.PIVOT"
                                                            :data-table-info.sync="state.proxyDataTableInfo"
        >
            <div class="pivot-form">
                <p-field-group :label="$t('COMMON.WIDGETS.CRITERIA')"
                               style-type="secondary"
                               required
                               class="criteria-field"
                >
                    <p-select-dropdown :menu="state.dataFieldItems"
                                       :selected="state.proxyFormData.fields?.data"
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
                                           :selected="state.proxyFormData.fields?.column"
                                           appearance-type="badge"
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
                                           use-fixed-menu-style
                                           multi-selectable
                                           appearance-type="badge"
                                           show-select-marker
                                           show-clear-selection
                                           block
                                           @select="handleSelectDynamicFields"
                                           @clear-selection="handleSelectDynamicFields([])"
                        />
                        <p-text-input v-else
                                      type="number"
                                      class="dynamic-field-auto-count"
                                      :min="1"
                                      :max="15"
                                      :placeholder="$t('COMMON.WIDGETS.MAX_ITEMS')"
                                      :invalid="!state.proxyFormData.limit"
                                      :value="state.proxyFormData.limit"
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
                                       :selected="state.proxyFormData.functions"
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
                                       :selected="state.proxyFormData.order_by?.type"
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
        }
    }
}
</style>
