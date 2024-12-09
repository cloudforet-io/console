import { _FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { FieldValueValidator } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { _FormatRulesOptions, _FormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { _CategoryByValue, CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { _CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { _GroupByOptions, _GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { _IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { MaxValue } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinValue } from '@/common/modules/widgets/_widget-fields/min/type';
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
    colorSchema: (fieldValue: ColorSchemaValue) => {
        if (!fieldValue.colorName || !fieldValue.colorValue?.length) return false;
        return true;
    },
    comparison: (fieldValue: ComparisonValue) => {
        if (fieldValue.toggleValue) {
            return !!fieldValue.decreaseColor && !!fieldValue.increaseColor && !!fieldValue.format;
        }
        return true;
    },
    customTableColumnWidth: (fieldValue: _CustomTableColumnWidthValue) => {
        if (fieldValue.widthInfos?.length) {
            return fieldValue.widthInfos.every((d) => !!d.fieldKey && d.width >= 0)
                || fieldValue.widthInfos.map((d) => d.fieldKey).length === new Set(fieldValue.widthInfos.map((d) => d.fieldKey)).size;
        }
        return true;
    },
    dataFieldHeatmapColor: () => true,
    dateFormat: () => true,
    displayAnnotation: (fieldValue: DisplayAnnotationValue) => {
        if (!fieldValue.toggleValue) return true;
        return !!fieldValue.annotation;
    },
    displaySeriesLabel: (fieldValue: DisplaySeriesLabelValue) => {
        if (!fieldValue.toggleValue || fieldValue.rotate === undefined) return true;
        if (fieldValue.rotate < -90 || fieldValue.rotate > 90) return false;
        return true;
    },
    granularity: (fieldValue: GranularityValue) => {
        if (!fieldValue.granularity) return false;
        return true;
    },
    groupBy: (fieldValue: _GroupByValue, widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const groupByOptions = _fieldsSchema.groupBy?.options as _GroupByOptions;
        if (groupByOptions.fixedValue && fieldValue.data !== groupByOptions.fixedValue) return false;
        if (groupByOptions.hideCount && !!fieldValue.count) return false;
        if (groupByOptions.multiSelectable && (!Array.isArray(fieldValue.data) || !fieldValue.data.length)) return false;
        if (groupByOptions.excludeDateField && fieldValue.data === 'date') return false;
        if (!fieldValue.count || fieldValue.count > groupByOptions.max) return false;
        return !!fieldValue.data;
    },
    header: (fieldValue: WidgetHeaderValue) => {
        if (!fieldValue.toggleValue) return true;
        return !!fieldValue.title?.trim();
    },
    icon: (fieldValue: _IconValue) => {
        if (!fieldValue.toggleValue) return true;
        return !!fieldValue.color && !!fieldValue.icon && ICON_FIELD_ITEMS.some((item) => item.name === fieldValue.icon?.name);
    },
    legend: () => true,
    max: (fieldValue: MaxValue) => {
        if (typeof fieldValue.max !== 'number') return false;
        if (fieldValue.max < 0) return false;
        return true;
    },
    min: (fieldValue: MinValue) => {
        if (typeof fieldValue.min !== 'number') return false;
        if (fieldValue.min < 0) return false;
        return true;
    },
    missingValue: () => true,
};


