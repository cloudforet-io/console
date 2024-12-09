import { COLOR_SCHEMA, DATE_FORMAT, DEFAULT_COMPARISON_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { FieldDefaultValueConvertor, WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { _FormatRulesOptions } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { _ColorSchemaOptions } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DateFormatOptions } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { _GroupByOptions } from '@/common/modules/widgets/_widget-fields/group-by/type';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { IconOptions } from '@/common/modules/widgets/_widget-fields/icon/type';
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
    colorSchema: {
        colorName: 'Coral',
        colorValue: COLOR_SCHEMA.Coral,
    },
    comparison: {
        decreaseColor: DEFAULT_COMPARISON_COLOR.DECREASE,
        increaseColor: DEFAULT_COMPARISON_COLOR.INCREASE,
        format: 'all',
        toggleValue: true,
    },
    customTableColumnWidth: {
        widthInfos: [],
    },
    dataFieldHeatmapColor: {},
    dateFormat: {
        format: Object.keys(DATE_FORMAT)[0],
    },
    dateRange: {},
    displayAnnotation: undefined,
    displaySeriesLabel: undefined,
    granularity: {
        granularity: 'MONTHLY',
    },
    groupBy: {},
    header: undefined,
    icon: {
        toggleValue: true,
        icon: { name: 'ic_circle-filled', label: 'Circle' },
        color: gray[900],
    },
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
    colorSchema: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const colorSchemaOptions = _fieldsSchema.colorSchema?.options as _ColorSchemaOptions;

        if (colorSchemaOptions.default) {
            return {
                colorName: colorSchemaOptions.default,
                colorValue: COLOR_SCHEMA[colorSchemaOptions.default],
            };
        }
        return widgetFieldDefaultValueMap.colorSchema;
    },
    comparison: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const comparisonOptions = _fieldsSchema.comparison?.options as ComparisonOptions;

        const initialValue = widgetFieldDefaultValueMap.comparison;

        if (comparisonOptions.toggle) {
            return {
                ...initialValue,
                toggleValue: true,
            };
        }
        return undefined;
    },
    customTableColumnWidth: () => widgetFieldDefaultValueMap.customTableColumnWidth,
    dataFieldHeatmapColor: () => widgetFieldDefaultValueMap.dataFieldHeatmapColor,
    dateFormat: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dateFormatOptions = _fieldsSchema.dateFormat?.options as DateFormatOptions;

        if (dateFormatOptions.default) {
            return {
                format: dateFormatOptions.default,
            };
        }

        return widgetFieldDefaultValueMap.dateFormat;
    },
    dateRange: () => widgetFieldDefaultValueMap.dateRange,
    displayAnnotation: () => widgetFieldDefaultValueMap.displayAnnotation,
    displaySeriesLabel: () => widgetFieldDefaultValueMap.displaySeriesLabel,
    granularity: () => widgetFieldDefaultValueMap.granularity,
    groupBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const groupByOptions = _fieldsSchema.groupBy?.options as _GroupByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable[groupByOptions.dataTarget]));

        result.data = groupByOptions.multiSelectable ? [fieldKeys?.[0]] : fieldKeys?.[0];

        if (!groupByOptions.hideCount) {
            result.count = groupByOptions.defaultMaxCount ? groupByOptions.defaultMaxCount : 5;
        }

        return result;
    },
    header: () => widgetFieldDefaultValueMap.header,
    icon: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const iconOptions = _fieldsSchema.icon?.options as IconOptions;

        const initialValue = widgetFieldDefaultValueMap.icon;

        if (iconOptions.toggle) {
            const defaultIcon = ICON_FIELD_ITEMS.find((item) => item.name === iconOptions.default);

            return {
                ...initialValue,
                toggleValue: true,
                icon: iconOptions.default ? defaultIcon : initialValue.icon,
            };
        }
        return undefined;
    },
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
