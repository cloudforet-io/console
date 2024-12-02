import type { FieldValueValidator } from '@/common/modules/widgets/_widget-field-value-manager/type';
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
};

const integrateFieldsSchema = (requiredFieldsSchema: WidgetConfig['requiredFieldsSchema'], optionalFieldsSchema: WidgetConfig['optionalFieldsSchema']) => ({
    ...requiredFieldsSchema,
    ...optionalFieldsSchema,
});
