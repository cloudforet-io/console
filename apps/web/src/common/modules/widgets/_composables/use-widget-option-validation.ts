import type { Ref } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { DataFieldOptions } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues, TableDataFieldValue, GroupByValue } from '@/common/modules/widgets/types/widget-field-value-type';


type OptionsValueMap = Record<string, WidgetFieldValues|undefined>;
interface WidgetOptionValidationProps {
    optionValueMap: Ref<OptionsValueMap>;
    config: WidgetConfig;
}

interface WidgetOptionValidationReturnType {
    optionsInvalid: Ref<boolean>;
}

export const useWidgetOptionValidation = ({
    optionValueMap,
    config,
}: WidgetOptionValidationProps): WidgetOptionValidationReturnType => {
    const _state = reactive({
        valueMap: optionValueMap,
        requiredFields: computed(() => Object.keys(config?.requiredFieldsSchema ?? {})),
        optionalFields: computed(() => Object.keys(config?.optionalFieldsSchema ?? {})),
    });

    const state = reactive({
        optionsInvalid: false,
    });

    const checkWidgetOptionsFieldsValidation = (valueMap: OptionsValueMap) => {
        // Required Fields Value Validation
        state.optionsInvalid = _state.requiredFields.some((field) => {
            const fieldValue = valueMap[field];
            if (field === 'granularity') {
                return !fieldValue;
            }
            if (field === 'dataField') {
                const isMultiSelectable = (config.requiredFieldsSchema[field]?.options as DataFieldOptions)?.multiSelectable;
                return isMultiSelectable && Array.isArray(fieldValue) ? !fieldValue.length : !fieldValue;
            }
            if (field === 'tableDataField') {
                const tableDataFieldValue = fieldValue as TableDataFieldValue;
                if (tableDataFieldValue?.fieldType === 'dynamicField') {
                    return !tableDataFieldValue.criteria || !tableDataFieldValue.value;
                }
                if (tableDataFieldValue?.fieldType === 'staticField') {
                    return !tableDataFieldValue.value?.length;
                }
                return false;
            }
            return Array.isArray(fieldValue?.value) ? !fieldValue?.value.length : !fieldValue?.value;
        });


        // Label Info Fields Value Duplicate Validation (Except Table Widget)
        const allFields = [..._state.requiredFields, ..._state.optionalFields];
        const labelInfoFields = allFields.filter((field) => config.requiredFieldsSchema[field]?.options?.dataTarget === 'labels_info'
            || config.optionalFieldsSchema[field]?.options?.dataTarget === 'labels_info');
        if (labelInfoFields.length > 1) {
            const labelInfoFieldValues = labelInfoFields.map((field) => valueMap[field]);
            const labelInfoFieldValuesSet = new Set(labelInfoFieldValues);
            state.optionsInvalid = labelInfoFieldValues.length !== labelInfoFieldValuesSet.size;
        }

        // Label Info Fields Value Duplicate Validation (Table Widget)
        if (config?.widgetName === 'table') {
            const groupByField = 'groupBy';
            const tableDataField = 'tableDataField';
            const groupByFieldValue = valueMap[groupByField] as GroupByValue;
            const tableDataFieldValue = valueMap[tableDataField] as TableDataFieldValue;
            const allValueExist = groupByFieldValue?.value && !!groupByFieldValue.value.length && tableDataFieldValue?.value;
            if (tableDataFieldValue?.fieldType === 'dynamicField' && allValueExist) {
                state.optionsInvalid = (groupByFieldValue?.value ?? []).includes(tableDataFieldValue.value as string);
            }
        }
    };

    watch(() => _state.valueMap, (changedValueMap) => {
        checkWidgetOptionsFieldsValidation(changedValueMap);
    }, { immediate: true, deep: true });

    return {
        ...toRefs(state),
    };
};
