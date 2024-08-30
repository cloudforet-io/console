import type { Ref } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type {
    GroupByValue,
    TableDataFieldValue,
    WidgetFieldValues,
} from '@/common/modules/widgets/types/widget-field-value-type';


type OptionsValueMap = Record<string, WidgetFieldValues|undefined>;
interface WidgetOptionValidationProps {
    optionValueMap: Ref<OptionsValueMap>;
    widgetConfig: Ref<WidgetConfig>;
}

interface WidgetOptionValidationReturnType {
    optionsInvalid: Ref<boolean>;
    optionsInvalidText: Ref<string|TranslateResult>;
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
        optionsInvalidText: computed(() => {
            if (_state.widgetConfig.widgetName === 'geoMap') {
                return i18n.t('COMMON.WIDGETS.FORM.WIDGET_VALIDATION_WARNING_DESC_GEO_MAP');
            }
            return i18n.t('COMMON.WIDGETS.FORM.WIDGET_VALIDATION_WARNING_DESC');
        }),
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
        if (!_state.requiredFields.every((field) => Object.keys(valueMap).includes(field))) return;
        state.optionsInvalid = getDuplicatedLabelInfoValidation(valueMap, config);
    };

    watch([() => _state.valueMap, () => _state.widgetConfig], ([changedValueMap, config]) => {
        checkWidgetOptionsFieldsValidation(changedValueMap, config);
    }, { immediate: true, deep: true });

    return {
        ...toRefs(state),
    };
};
