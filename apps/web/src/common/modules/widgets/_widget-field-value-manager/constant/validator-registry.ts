import { _FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { FieldValueValidator } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { _FormatRulesOptions, _FormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { _CategoryByValue, CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { _StackByValue, StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { _XAxisValue, XAxisOptions } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { _YAxisValue, YAxisOptions } from '@/common/modules/widgets/_widget-fields/y-axis/type';

export interface WidgetValidatorRegistry {
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
    categoryBy: (fieldValue: _CategoryByValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const categoryByOptions = _fieldsSchema.categoryBy?.options as CategoryByOptions;
        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0 || fieldValue.count > categoryByOptions.max) return false;
        return true;
    },
    stackBy: (fieldValue: _StackByValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const stackByOptions = _fieldsSchema.stackBy?.options as StackByOptions;
        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0 || fieldValue.count > stackByOptions.max) return false;
        return true;
    },
    xAxis: (fieldValue: _XAxisValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const xAxisOptions = _fieldsSchema.xAxis?.options as XAxisOptions;
        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0 || fieldValue.count > xAxisOptions.max) return false;
        return true;
    },
    yAxis: (fieldValue: _YAxisValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const yAxisOptions = _fieldsSchema.yAxis?.options as YAxisOptions;
        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0 || fieldValue.count > yAxisOptions.max) return false;
        return true;
    },
};


