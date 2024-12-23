import type { Ref } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import type { WidgetFieldValue } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { GroupByOptions, GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type {
    WidgetFieldValues,
} from '@/common/modules/widgets/types/widget-field-value-type';


type OptionsValueMap = Record<string, WidgetFieldValue<WidgetFieldValues>|undefined>;
interface WidgetOptionValidationProps {
    optionValueMap: Ref<OptionsValueMap>;
    widgetConfig: Ref<WidgetConfig>;
}

interface WidgetOptionValidationReturnType {
    invalid: Ref<boolean>;
    invalidText: Ref<string|TranslateResult>;
}

export const useWidgetOptionsComplexValidation = ({
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
        invalid: false,
        invalidText: computed(() => {
            if (_state.widgetConfig.widgetName === 'geoMap') {
                const fixedVal = (_state.widgetConfig.requiredFieldsSchema.groupBy?.options as GroupByOptions)?.fixedValue;
                const val = (_state.valueMap?.groupBy?.value as GroupByValue)?.data;
                if (fixedVal) {
                    if ((Array.isArray(val) && !val.includes(fixedVal)) || val !== fixedVal) {
                        return i18n.t('COMMON.WIDGETS.FORM.WIDGET_VALIDATION_WARNING_DESC_GEO_MAP');
                    }
                }
            }
            return i18n.t('COMMON.WIDGETS.FORM.WIDGET_VALIDATION_WARNING_DESC');
        }),
    });

    const getRequiredFieldValidation = (valueMap: OptionsValueMap, config: WidgetConfig): boolean => {
        if (config.widgetName === 'geoMap') {
            const fixedVal = (config.requiredFieldsSchema.groupBy?.options as GroupByOptions)?.fixedValue;
            const val = (valueMap?.groupBy?.value as GroupByValue)?.data;
            if (fixedVal) {
                if (Array.isArray(val)) return val.includes(fixedVal);
                return val === fixedVal;
            }
        }
        return true;
    };
    const getDuplicatedLabelInfoValidation = (valueMap: OptionsValueMap, config: WidgetConfig): boolean => {
        let isValid = true;
        // Label Info Fields Value Duplicate Validation (Table Widget)
        if (config.widgetName !== 'table') {
            // Label Info Fields Value Duplicate Validation (Except Table Widget)
            const allFields = [..._state.requiredFields, ..._state.optionalFields];
            const labelInfoFields = allFields.filter((field) => config.requiredFieldsSchema[field]?.options?.dataTarget === 'labels_info'
                || config.optionalFieldsSchema[field]?.options?.dataTarget === 'labels_info');
            if (labelInfoFields.length > 1) {
                const labelInfoFieldValues = labelInfoFields.map((field) => valueMap[field]?.value);
                const labelInfoFieldValuesSet = new Set(labelInfoFieldValues);
                isValid = labelInfoFieldValues.length === labelInfoFieldValuesSet.size;
            }
        }

        return isValid;
    };

    const checkWidgetOptionsFieldsValidation = (valueMap: OptionsValueMap, config: WidgetConfig) => {
        if (!_state.requiredFields.every((field) => Object.keys(valueMap).includes(field))) return;
        const isRequiredFieldsValid = getRequiredFieldValidation(valueMap, config);
        const isDuplicatedLabelInfoValid = getDuplicatedLabelInfoValidation(valueMap, config);
        state.invalid = !isRequiredFieldsValid || !isDuplicatedLabelInfoValid;
    };

    watch([() => _state.valueMap, () => _state.widgetConfig], ([changedValueMap, config]) => {
        checkWidgetOptionsFieldsValidation(changedValueMap, config);
    }, { immediate: true, deep: true });

    return {
        ...toRefs(state),
    };
};
