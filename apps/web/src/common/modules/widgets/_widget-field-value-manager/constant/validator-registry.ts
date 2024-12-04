import { _FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { FieldValueValidator } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { _FormatRulesOptions, _FormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

interface WidgetValidatorRegistry {
    [fieldKey: string]: FieldValueValidator<any>;
}

export const widgetValidatorRegistry: WidgetValidatorRegistry = {
    dataField: (fieldValue: DataFieldValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldOptions = _fieldsSchema.dataField?.options as DataFieldOptions;
        if (dataFieldOptions.multiSelectable) {
            return Array.isArray(fieldValue.data) && !!fieldValue.data.length;
        }
        return !!fieldValue.data;
    },
    formatRules: (fieldValue: _FormatRulesValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = _fieldsSchema.formatRules?.options as _FormatRulesOptions;
        const type = formatRulesOptions.formatRulesType;

        if (type === _FORMAT_RULE_TYPE.textThreshold) {
            return fieldValue.rules.every((d) => !!d.text && !!d.color);
        }
        if (type === _FORMAT_RULE_TYPE.numberThreshold || type === _FORMAT_RULE_TYPE.percentThreshold) {
            return fieldValue.rules.every((d) => !!d.number && !!d.color);
        }
        if (type === _FORMAT_RULE_TYPE.textNumberTreshold) {
            return fieldValue.rules.every((d) => !!d.text && !!d.number && !!d.color);
        }
        if (formatRulesOptions.useField) {
            return !!fieldValue.field;
        }
        return true;
    },
};

const integrateFieldsSchema = (requiredFieldsSchema: WidgetConfig['requiredFieldsSchema'], optionalFieldsSchema: WidgetConfig['optionalFieldsSchema']) => ({
    ...requiredFieldsSchema,
    ...optionalFieldsSchema,
});
