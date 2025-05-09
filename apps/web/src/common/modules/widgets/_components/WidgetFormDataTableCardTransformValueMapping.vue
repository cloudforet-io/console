<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { random } from 'lodash';

import {
    PButton, PFieldGroup, PSelectButton, PTextInput, PSelectDropdown, PFieldTitle, PIconButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_TABLE_FIELD_TYPE,
    DATA_TABLE_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { ValueMappingOptions } from '@/common/modules/widgets/types/widget-model';




type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const COMPONENT_RANDOM_KEY = `value-mapping-${random()}`;

const props = defineProps<TransformDataTableProps<ValueMappingOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: ValueMappingOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    currentDataTable: computed<Partial<DataTableModel>|undefined>(() => dataTableList.value.find((d) => d.data_table_id === dataTableInfo.value.dataTableId)),
});

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const fieldTypeInfo = ref<ValueMappingOptions['field_type']>(props.originData?.field_type || DATA_TABLE_FIELD_TYPE.LABEL);
const fieldNameInfo = ref<string>(props.originData?.name || '');
const keyInfo = ref<string|undefined>(props.originData?.key);
const casesInfo = ref<ValueMappingOptions['cases']>(props.originData?.cases || []);
const elseInfo = ref<string|undefined>(props.originData?.else);
const additionalConditionInfo = ref<string|undefined>(props.originData?.condition);



const state = reactive({
    proxyOperatorOptions: useProxyValue<ValueMappingOptions>('operator-options', props, emit),
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions?.data_table_id) return true;
        if (!fieldNameInfo.value) return true;
        if (!fieldTypeInfo.value) return true;
        if (!keyInfo.value) return true;
        if (!isFieldNameValid(fieldNameInfo.value, storeState.currentDataTable)) return true;
        if (casesInfo.value.length === 0) return true;
        if (!casesInfo.value.every((d) => !!d.operator && !!d.match && !!d.value)) return true;
        return false;
    }),
    fieldTypeMenuItems: computed<MenuItem[]>(() => [
        {
            name: DATA_TABLE_FIELD_TYPE.LABEL,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.TYPE_LABEL_FIELD'),
        },
        {
            name: DATA_TABLE_FIELD_TYPE.DATA,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.TYPE_DATA_FIELD'),
        },
    ]),
    basedOnMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        let _targetInfo = storeState.currentDataTable?.labels_info || {};
        if (fieldTypeInfo.value === DATA_TABLE_FIELD_TYPE.DATA) {
            _targetInfo = storeState.currentDataTable?.data_info || {};
        }
        return Object.keys(_targetInfo).map((d) => ({
            name: d,
            label: d,
        })) || [];
    }),
    matchesWidthMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'eq',
            // label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EQUALS'),
            label: 'Value',
        },
        {
            name: 'regex',
            // label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.REGEX'),
            label: 'Regex',
        },
    ])),
    expandCaseMap: {} as Record<number, boolean>,
});

/* Helper */
const getInvalidFieldNameText = (fieldName?: string): TranslateResult|undefined => {
    if (!fieldName) return undefined;
    if (!isFieldNameValid(fieldName, storeState.currentDataTable)) return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DUPLICATED_FIELD_NAME');
    return undefined;
};
const isFieldNameValid = (fieldName: string, dataTable?: Partial<PublicDataTableModel|PrivateDataTableModel>): boolean => {
    if (!dataTable) return true;
    const _dataInfoKeys = Object.keys(dataTable.data_info || {});
    return !_dataInfoKeys.includes(fieldName);
};

/* Event */
const handleChangeFieldType = (fieldType: ValueMappingOptions['field_type']) => {
    fieldTypeInfo.value = fieldType;
};
const handleClickAddCase = () => {
    casesInfo.value.push({
        value: '',
        operator: 'eq',
        match: '',
    });
};
const handleClickDeleteCase = (idx: number) => {
    casesInfo.value.splice(idx, 1);
};
// const handleClickExpand = (idx: number) => {
//     state.expandCaseMap[idx] = !state.expandCaseMap[idx];
//     state.expandCaseMap = { ...state.expandCaseMap };
// };
const handleUpdateBasedOn = (key: string) => {
    keyInfo.value = key;
};
const handleUpdateOperator = (idx: number, operator: 'eq'|'regex') => {
    const prevCases = [...casesInfo.value];
    casesInfo.value = [
        ...prevCases.slice(0, idx),
        {
            ...prevCases[idx],
            operator,
        },
        ...prevCases.slice(idx + 1),
    ];
};
const handleUpdatePattern = (idx: number, pattern: string) => {
    const prevCases = [...casesInfo.value];
    casesInfo.value = [
        ...prevCases.slice(0, idx),
        {
            ...prevCases[idx],
            match: pattern,
        },
        ...prevCases.slice(idx + 1),
    ];
};
const handleUpdateValue = (idx: number, value: string) => {
    const prevCases = [...casesInfo.value];
    casesInfo.value = [
        ...prevCases.slice(0, idx),
        {
            ...prevCases[idx],
            value,
        },
        ...prevCases.slice(idx + 1),
    ];
};

// Update operator options
watch([dataTableInfo, fieldTypeInfo, fieldNameInfo, keyInfo, casesInfo, elseInfo, additionalConditionInfo], (
    [_dataTableInfo, _fieldTypeInfo, _fieldNameInfo, _keyInfo, _casesInfo, _elseInfo, _additionalConditionInfo],
) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        name: _fieldNameInfo,
        field_type: _fieldTypeInfo,
        key: _keyInfo,
        cases: _casesInfo,
        ...(_elseInfo && { else: _elseInfo }),
        ...(_additionalConditionInfo && { condition: _additionalConditionInfo }),
    };
}, { deep: true, immediate: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });
</script>

<template>
    <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                        :operator="DATA_TABLE_OPERATOR.VALUE_MAPPING"
                                                        :data-table-info.sync="dataTableInfo"
                                                        class="widget-form-data-table-card-transform-value-mapping"
    >
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_TYPE')"
                       required
        >
            <div class="flex gap-2">
                <p-select-button v-for="selectItem in state.fieldTypeMenuItems"
                                 :key="`select-button-${selectItem.name}`"
                                 :value="selectItem.name"
                                 style-type="secondary"
                                 :selected="fieldTypeInfo"
                                 @change="handleChangeFieldType"
                >
                    {{ selectItem.label }}
                </p-select-button>
            </div>
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_NAME')"
                       required
                       :invalid-text="getInvalidFieldNameText(fieldNameInfo)"
                       :invalid="!!getInvalidFieldNameText(fieldNameInfo)"
        >
            <template #default="{invalid}">
                <p-text-input v-model="fieldNameInfo"
                              block
                              :invalid="invalid"
                />
            </template>
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.BASED_ON')"
                       style-type="secondary"
                       required
        >
            <p-select-dropdown :menu="state.basedOnMenuItems"
                               :selected="keyInfo"
                               block
                               @update:selected="handleUpdateBasedOn"
            />
        </p-field-group>
        <p-field-title :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.CASES')"
                       required
                       class="mb-1"
        />
        <div class="case-form-wrapper">
            <div v-for="(_case, cIdx) in casesInfo"
                 :key="`${COMPONENT_RANDOM_KEY}-case-${cIdx}`"
                 class="case-form-card"
                 :class="{ 'expanded': state.expandCaseMap[cIdx] }"
            >
                <div class="button-wrapper">
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   :disabled="casesInfo.length === 1"
                                   @click="handleClickDeleteCase(cIdx)"
                    />
                    <!--                    <p-icon-button name="ic_arrows-expand-all"-->
                    <!--                                   size="sm"-->
                    <!--                                   class="expand-button"-->
                    <!--                                   @click="handleClickExpand(cIdx)"-->
                    <!--                    />-->
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.MATCHES_WITH')"
                                   style-type="secondary"
                                   required
                                   class="col-span-4"
                    >
                        <p-select-dropdown :menu="state.matchesWidthMenuItems"
                                           :selected="_case.operator"
                                           block
                                           class="matches-with-dropdown"
                                           @update:selected="handleUpdateOperator(cIdx, $event)"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.PATTERN')"
                                   style-type="secondary"
                                   required
                                   class="col-span-8"
                    >
                        <p-text-input :value="_case.match"
                                      block
                                      @update:value="handleUpdatePattern(cIdx, $event)"
                        />
                    </p-field-group>
                </div>
                <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.VALUE')"
                               style-type="secondary"
                               required
                >
                    <p-text-input :value="_case.value"
                                  block
                                  @update:value="handleUpdateValue(cIdx, $event)"
                    />
                </p-field-group>
            </div>
            <p-button class="add-field-button"
                      style-type="tertiary"
                      icon-left="ic_plus_bold"
                      @click="handleClickAddCase"
            >
                {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_CASE') }}
            </p-button>
        </div>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ELSE')">
            <p-text-input v-model="elseInfo"
                          block
            />
        </p-field-group>
        <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.ADDITIONAL_CONDITION')">
            <p-text-input v-model="additionalConditionInfo"
                          block
            />
        </p-field-group>
    </widget-form-data-table-card-transform-form-wrapper>
</template>

<style scoped lang="scss">
.widget-form-data-table-card-transform-value-mapping {
    .case-form-wrapper {
        @apply bg-gray-100 rounded-lg;
        padding: 0.625rem 0.5rem;
        margin-bottom: 0.5rem;
        .case-form-card {
            @apply bg-white rounded border border-gray-150;
            position: relative;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            &.expanded {
                width: 35rem;
            }
            .button-wrapper {
                position: absolute;
                top: 0.125rem;
                right: 0.125rem;
            }
            .matches-with-dropdown {
                min-width: auto;
            }
        }
    }
}
</style>
