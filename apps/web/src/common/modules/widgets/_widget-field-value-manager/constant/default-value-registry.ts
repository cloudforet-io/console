import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
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
    colorSchema: {},
    comparison: {},
    customTableColumnWidth: {},
    dataFieldHeatmapColor: {},
    dateAggregationOptions: {},
    dateFormat: {},
    dateRange: {},
    displayAnnotation: {},
    displaySeriesLabel: {},
    granularity: {},
    groupBy: {},
    header: {},
    icon: {},
    legend: {},
    max: {},
    min: {},
    missingValue: {},
    numberFormat: {},
    pieChartType: {},
    progressBar: {},
    subTotal: {},
    tableColumnWidth: {},
    textWrap: {},
    tooltipNumberFormat: {},
    total: {},
    widgetHeight: {},
} as const;

export type WidgetFieldDefaultValueSetterRegistry = {
    [K in keyof WidgetFieldTypeMap]: FieldDefaultValueConvertor<K>;
};

export const widgetFieldDefaultValueSetterRegistry: WidgetFieldDefaultValueSetterRegistry = {
    formatRules: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = _fieldsSchema.formatRules?.options as _FormatRulesOptions;

        let result = widgetFieldDefaultValueMap.formatRules;

        if (formatRulesOptions.default || formatRulesOptions.baseColor) {
            result = {
                ...result,
                rules: formatRulesOptions.default ?? widgetFieldDefaultValueMap.formatRules.rules,
                baseColor: formatRulesOptions.baseColor ?? widgetFieldDefaultValueMap.formatRules.baseColor,
            };
        }
        if (formatRulesOptions.useField && formatRulesOptions.dataTarget) {
            const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[formatRulesOptions.dataTarget]));
            result = {
                ...result,
                field: fieldKeys?.[0],
            };
        }
        return result;
    },
    categoryBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const categoryByOptions = _fieldsSchema.categoryBy?.options as CategoryByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[categoryByOptions.dataTarget]));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: categoryByOptions.defaultMaxCount,
        };
    },
    stackBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const stackByOptions = _fieldsSchema.stackBy?.options as StackByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[stackByOptions.dataTarget]));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: stackByOptions.defaultMaxCount,
        };
    },
    xAxis: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const xAxisOptions = _fieldsSchema.xAxis?.options as XAxisOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[xAxisOptions.dataTarget]));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: xAxisOptions.defaultMaxCount,
        };
    },
    yAxis: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const yAxisOptions = _fieldsSchema.yAxis?.options as YAxisOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[yAxisOptions.dataTarget]));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: yAxisOptions.defaultMaxCount,
        };
    },
    colorSchema: () => widgetFieldDefaultValueMap.colorSchema,
    comparison: () => widgetFieldDefaultValueMap.comparison,
    customTableColumnWidth: () => widgetFieldDefaultValueMap.customTableColumnWidth,
    dataFieldHeatmapColor: () => widgetFieldDefaultValueMap.dataFieldHeatmapColor,
    dateAggregationOptions: () => widgetFieldDefaultValueMap.dateAggregationOptions,
    dateFormat: () => widgetFieldDefaultValueMap.dateFormat,
    dateRange: () => widgetFieldDefaultValueMap.dateRange,
    displayAnnotation: () => widgetFieldDefaultValueMap.displayAnnotation,
    displaySeriesLabel: () => widgetFieldDefaultValueMap.displaySeriesLabel,
    granularity: () => widgetFieldDefaultValueMap.granularity,
    groupBy: () => widgetFieldDefaultValueMap.groupBy,
    header: () => widgetFieldDefaultValueMap.header,
    icon: () => widgetFieldDefaultValueMap.icon,
    legend: () => widgetFieldDefaultValueMap.legend,
    max: () => widgetFieldDefaultValueMap.max,
    min: () => widgetFieldDefaultValueMap.min,
    missingValue: () => widgetFieldDefaultValueMap.missingValue,
    numberFormat: () => widgetFieldDefaultValueMap.numberFormat,
    pieChartType: () => widgetFieldDefaultValueMap.pieChartType,
    progressBar: () => widgetFieldDefaultValueMap.progressBar,
    subTotal: () => widgetFieldDefaultValueMap.subTotal,
    tableColumnWidth: () => widgetFieldDefaultValueMap.tableColumnWidth,
    textWrap: () => widgetFieldDefaultValueMap.textWrap,
    tooltipNumberFormat: () => widgetFieldDefaultValueMap.tooltipNumberFormat,
    total: () => widgetFieldDefaultValueMap.total,
    widgetHeight: () => widgetFieldDefaultValueMap.widgetHeight,
};