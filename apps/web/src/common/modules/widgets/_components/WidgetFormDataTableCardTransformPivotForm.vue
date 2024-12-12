<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PDivider, PFieldGroup, PSelectButton, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

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
    selectedDynamicFieldMenuItems: computed(() => []),
    dynamicFieldLoading: false,
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
                                           :menu="[]"
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
    }
}
</style>
