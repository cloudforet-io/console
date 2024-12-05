import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { FieldDefaultValueConvertor, WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { _FormatRulesOptions } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { XAxisOptions } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { YAxisOptions } from '@/common/modules/widgets/_widget-fields/y-axis/type';

import { gray } from '@/styles/colors';

type DefaultValueRegistry = Record<keyof WidgetFieldTypeMap, any>;

export const widgetFieldDefaultValueMap: DefaultValueRegistry = {
    dataField: {},
    formatRules: {
        baseColor: gray[200],
        rules: [],
    },
    categoryBy: {},
    stackBy: {},
    xAxis: {},
    yAxis: {},
} as const;

export type WidgetFieldDefaultValueSetterRegistry = {
    [K in keyof WidgetFieldTypeMap]: FieldDefaultValueConvertor<K>;
};

export const widgetFieldDefaultValueSetterRegistry: WidgetFieldDefaultValueSetterRegistry = {
    formatRules: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = _fieldsSchema.formatRules?.options as _FormatRulesOptions;

        if (formatRulesOptions.default || formatRulesOptions.baseColor) {
            return {
                rules: formatRulesOptions.default ?? widgetFieldDefaultValueMap.formatRules.rules,
                baseColor: formatRulesOptions.baseColor ?? widgetFieldDefaultValueMap.formatRules.baseColor,
            };
        }
        return widgetFieldDefaultValueMap.formatRules;
    },
    categoryBy: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const categoryByOptions = _fieldsSchema.categoryBy?.options as CategoryByOptions;

        if (categoryByOptions.max >= categoryByOptions?.defaultMaxCount) {
            return {
                count: categoryByOptions.defaultMaxCount,
            };
        }
        return widgetFieldDefaultValueMap.categoryBy;
    },
    stackBy: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const stackByOptions = _fieldsSchema.stackBy?.options as StackByOptions;

        return {
            count: stackByOptions.defaultMaxCount,
        };
    },
    xAxis: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const xAxisOptions = _fieldsSchema.xAxis?.options as XAxisOptions;

        return {
            count: xAxisOptions.defaultMaxCount,
        };
    },
    yAxis: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const yAxisOptions = _fieldsSchema.yAxis?.options as YAxisOptions;

        return {
            count: yAxisOptions.defaultMaxCount,
        };
    },
};
