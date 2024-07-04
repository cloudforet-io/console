import type { Ref } from 'vue';
import {
    computed, reactive, watch,
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
    optionsInvalid: boolean;
    optionsInvalidText: string;
}

export const useWidgetOptionValidation = ({
    optionValueMap,
    config,
}: WidgetOptionValidationProps): WidgetOptionValidationReturnType => {
    const _state = reactive({
        valueMap: optionValueMap,
        requiredFields: computed(() => Object.keys(config.requiredFieldsSchema)),
        optionalFields: computed(() => Object.keys(config.optionalFieldsSchema)),
    });

    const state = reactive({
        invalid: false,
        invalidText: computed(() => 'fuck'),
    });

    const checkWidgetOptionsFieldsValidation = (valueMap: OptionsValueMap) => {
        // Required Fields Value Validation
        _state.requiredFields.forEach((field) => {
            const fieldValue = valueMap[field];
            if (field === 'granularity') {
                state.invalid = !fieldValue;
                return;
            }
            if (field === 'dataField') {
                const isMultiSelectable = (config.requiredFieldsSchema[field]?.options as DataFieldOptions)?.multiSelectable;
                state.invalid = isMultiSelectable && Array.isArray(fieldValue) ? !fieldValue.length : !fieldValue;
            }
            if (field === 'tableDataField') {
                const tableDataFieldValue = fieldValue as TableDataFieldValue;
                if (tableDataFieldValue?.fieldType === 'dynamicField') {
                    state.invalid = !tableDataFieldValue.criteria || !tableDataFieldValue.value;
                    return;
                }
                if (tableDataFieldValue?.fieldType === 'staticField') {
                    state.invalid = !tableDataFieldValue.value || !tableDataFieldValue.value.length;
                    return;
                }
                return;
            }
            state.invalid = !fieldValue?.value;
        });

        // Label Info Fields Value Duplicate Validation (Except Table Widget)
        const allFields = [..._state.requiredFields, ..._state.optionalFields];
        const labelInfoFields = allFields.filter((field) => config.requiredFieldsSchema[field]?.options?.dataTarget === 'labels_info'
            || config.optionalFieldsSchema[field]?.options?.dataTarget === 'labels_info');
        if (labelInfoFields.length > 1) {
            const labelInfoFieldValues = labelInfoFields.map((field) => valueMap[field]);
            const labelInfoFieldValuesSet = new Set(labelInfoFieldValues);
            state.invalid = labelInfoFieldValues.length !== labelInfoFieldValuesSet.size;
        }

        // Label Info Fields Value Duplicate Validation (Table Widget)
        if (config.widgetName === 'table') {
            const groupByField = 'groupBy';
            const tableDataField = 'tableDataField';
            const groupByFieldValue = valueMap[groupByField] as GroupByValue;
            const tableDataFieldValue = valueMap[tableDataField] as TableDataFieldValue;
            if (tableDataFieldValue.fieldType === 'dynamicField') {
                state.invalid = (groupByFieldValue?.value ?? []).includes(tableDataFieldValue.value as string);
            }
        }
    };

    watch(() => _state.valueMap, (changedValueMap) => {
        checkWidgetOptionsFieldsValidation(changedValueMap);
    }, { immediate: true, deep: true });

    return {
        optionsInvalid: state.invalid,
        optionsInvalidText: state.invalidText,
    };
};
