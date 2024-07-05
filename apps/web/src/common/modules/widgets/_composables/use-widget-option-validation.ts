import type { Ref } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { DataFieldOptions } from '@/common/modules/widgets/types/widget-field-type';
import type {
    WidgetFieldValues, TableDataFieldValue, GroupByValue, FormatRulesValue,
    ColorSchemaValue,
} from '@/common/modules/widgets/types/widget-field-value-type';


type OptionsValueMap = Record<string, WidgetFieldValues|undefined>;
interface WidgetOptionValidationProps {
    optionValueMap: Ref<OptionsValueMap>;
    widgetConfig: Ref<WidgetConfig>;
}

interface WidgetOptionValidationReturnType {
    optionsInvalid: Ref<boolean>;
}

export const useWidgetOptionValidation = ({
    optionValueMap,
    widgetConfig,
}: WidgetOptionValidationProps): WidgetOptionValidationReturnType => {
    const _state = reactive({
        valueMap: optionValueMap,
        widgetConfig,
        requiredFields: computed(() => Object.keys(widgetConfig.value?.requiredFieldsSchema ?? {})),
        optionalFields: computed(() => Object.keys(widgetConfig.value?.optionalFieldsSchema ?? {})),
    });

    const state = reactive({
        optionsInvalid: false,
    });

    const getRequiredFieldValidation = (valueMap: OptionsValueMap, config: WidgetConfig) => _state.requiredFields.some((field) => {
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
        if (field === 'min' || field === 'max') {
            return fieldValue === undefined;
        }
        if (field === 'formatRules') {
            const formatRulesValue = fieldValue as FormatRulesValue[];
            return formatRulesValue.some((rule) => rule.threshold === undefined);
        }
        if (field === 'colorSchema') {
            const colorSchemaValue = fieldValue as ColorSchemaValue;
            return !colorSchemaValue.colorValue.length || !colorSchemaValue.colorName;
        }

        return Array.isArray(fieldValue?.value) ? !fieldValue?.value.length : !fieldValue?.value;
    });

    const getDuplicatedLabelInfoValidation = (valueMap: OptionsValueMap, config: WidgetConfig) => {
        let invalid = false;
        // Label Info Fields Value Duplicate Validation (Table Widget)
        if (config.widgetName === 'table') {
            const groupByField = 'groupBy';
            const tableDataField = 'tableDataField';
            const groupByFieldValue = valueMap[groupByField] as GroupByValue;
            const tableDataFieldValue = valueMap[tableDataField] as TableDataFieldValue;
            const allValueExist = groupByFieldValue?.value && !!groupByFieldValue.value.length && tableDataFieldValue?.value;
            if (tableDataFieldValue?.fieldType === 'dynamicField' && allValueExist) {
                invalid = (groupByFieldValue?.value ?? []).includes(tableDataFieldValue.value as string);
            }
        } else {
            // Label Info Fields Value Duplicate Validation (Except Table Widget)
            const allFields = [..._state.requiredFields, ..._state.optionalFields];
            const labelInfoFields = allFields.filter((field) => config.requiredFieldsSchema[field]?.options?.dataTarget === 'labels_info'
                || config.optionalFieldsSchema[field]?.options?.dataTarget === 'labels_info');
            if (labelInfoFields.length > 1) {
                const labelInfoFieldValues = labelInfoFields.map((field) => valueMap[field]?.value);
                const labelInfoFieldValuesSet = new Set(labelInfoFieldValues);
                invalid = labelInfoFieldValues.length !== labelInfoFieldValuesSet.size;
            }
        }

        return invalid;
    };

    const checkWidgetOptionsFieldsValidation = (valueMap: OptionsValueMap, config: WidgetConfig) => {
        const requiredFieldInvalid = getRequiredFieldValidation(valueMap, config);
        const duplicatedLabelInfo = getDuplicatedLabelInfoValidation(valueMap, config);

        state.optionsInvalid = requiredFieldInvalid || duplicatedLabelInfo;
    };

    watch([() => _state.valueMap, () => _state.widgetConfig], ([changedValueMap, config]) => {
        checkWidgetOptionsFieldsValidation(changedValueMap, config);
    }, { immediate: true, deep: true });

    return {
        ...toRefs(state),
    };
};
