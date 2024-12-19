import {
    COLOR_SCHEMA, DATA_FIELD_HEATMAP_COLOR, DATE_FORMAT, DEFAULT_COMPARISON_COLOR, NUMBER_FORMAT, TABLE_DEFAULT_MINIMUM_WIDTH, WIDGET_HEIGHT,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { FieldDefaultValueConvertor, WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { FormatRulesOptions } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { _ColorSchemaOptions as ColorSchemaOptions } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DataFieldHeatmapColorOptions, DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldOptions } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatOptions } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { _GroupByOptions } from '@/common/modules/widgets/_widget-fields/group-by/type';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { IconOptions } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { _LegendOptions } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { MaxOptions } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinOptions } from '@/common/modules/widgets/_widget-fields/min/type';
import type { MissingValueOptions } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatOptions, NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeOptions } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { SubTotalOptions } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { TableColumnWidthOptions } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapOptions } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TooltipNumberFormatOptions } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { TotalOptions } from '@/common/modules/widgets/_widget-fields/total/type';
import type { WidgetHeightOptions } from '@/common/modules/widgets/_widget-fields/widget-height/type';
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
    dateRange: {
        inherit: true,
        options: {
            value: 'auto',
        },
    },
    displayAnnotation: {
        toggleValue: false,
    },
    displaySeriesLabel: {
        toggleValue: false,
    },
    granularity: {
        granularity: 'MONTHLY',
    },
    groupBy: {},
    header: {
        toggleValue: false,
    },
    icon: {
        toggleValue: true,
        icon: { name: 'ic_circle-filled', label: 'Circle' },
        color: gray[900],
    },
    legend: {
        toggleValue: true,
        position: 'right',
    },
    max: {
        max: 0,
    },
    min: {
        min: 0,
    },
    missingValue: {
        type: 'lineToZero',
    },
    numberFormat: {},
    pieChartType: {
        type: 'pie',
    },
    subTotal: {
        toggleValue: false,
    },
    total: {
        toggleValue: false,
    },
    tableColumnWidth: {
        minimumWidth: TABLE_DEFAULT_MINIMUM_WIDTH,
        widthType: 'auto',
        fixedWidth: undefined,
    },
    textWrap: {
        toggleValue: false,
    },
    tooltipNumberFormat: {
        toggleValue: false,
    },
    widgetHeight: {
        type: WIDGET_HEIGHT.default,
    },
} as const;

export type WidgetFieldDefaultValueSetterRegistry = {
    [K in keyof WidgetFieldTypeMap]: FieldDefaultValueConvertor<K>;
};

export const widgetFieldDefaultValueSetterRegistry: WidgetFieldDefaultValueSetterRegistry = {
    dataField: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldOptions = (_fieldsSchema.dataField?.options ?? {}) as DataFieldOptions;

        const result = widgetFieldDefaultValueMap.dataField;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.data_info ?? {}));

        if (dataFieldOptions.multiSelectable) {
            result.data = dataFieldOptions.allSelected ? fieldKeys : [fieldKeys?.[0]];
        } else {
            result.data = fieldKeys?.[0];
        }


        return result;
    },
    formatRules: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = (_fieldsSchema.formatRules?.options ?? {}) as FormatRulesOptions;

        let result = widgetFieldDefaultValueMap.formatRules;

        if (formatRulesOptions.default || formatRulesOptions.baseColor) {
            result = {
                ...result,
                rules: formatRulesOptions.default ?? widgetFieldDefaultValueMap.formatRules.rules,
                baseColor: formatRulesOptions.baseColor ?? widgetFieldDefaultValueMap.formatRules.baseColor,
            };
        }
        if (formatRulesOptions.useField && formatRulesOptions.dataTarget) {
            const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[formatRulesOptions.dataTarget] ?? {}));
            result = {
                ...result,
                field: fieldKeys?.[0],
            };
        }
        return result;
    },
    categoryBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const categoryByOptions = (_fieldsSchema.categoryBy?.options ?? {}) as CategoryByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[categoryByOptions.dataTarget] ?? {}));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: categoryByOptions.defaultMaxCount,
        };
    },
    stackBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const stackByOptions = (_fieldsSchema.stackBy?.options ?? {}) as StackByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[stackByOptions.dataTarget] ?? {}));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: stackByOptions.defaultMaxCount,
        };
    },
    xAxis: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const xAxisOptions = (_fieldsSchema.xAxis?.options ?? {}) as XAxisOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[xAxisOptions.dataTarget] ?? {}));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: xAxisOptions.defaultMaxCount,
        };
    },
    yAxis: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const yAxisOptions = (_fieldsSchema.yAxis?.options ?? {}) as YAxisOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[yAxisOptions.dataTarget] ?? {}));

        return {
            ...result,
            data: fieldKeys?.[0],
            count: yAxisOptions.defaultMaxCount,
        };
    },
    colorSchema: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const colorSchemaOptions = (_fieldsSchema.colorSchema?.options ?? {}) as ColorSchemaOptions;

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
        const comparisonOptions = (_fieldsSchema.comparison?.options ?? {}) as ComparisonOptions;

        if (comparisonOptions.toggle) {
            return widgetFieldDefaultValueMap.comparison;
        }

        return {
            toggleValue: false,
        };
    },
    customTableColumnWidth: () => widgetFieldDefaultValueMap.customTableColumnWidth,
    dataFieldHeatmapColor: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldheatmapColorOptions = (_fieldsSchema.dataFieldHeatmapColor?.options ?? {}) as DataFieldHeatmapColorOptions;

        const dataKeys = Object.keys(dataTable?.data_info ?? {}) as string[];

        const result: DataFieldHeatmapColorValue = widgetFieldDefaultValueMap.dataFieldHeatmapColor;
        dataKeys.forEach((key) => {
            result[key] = {
                colorInfo: dataFieldheatmapColorOptions?.default ?? DATA_FIELD_HEATMAP_COLOR.NONE.key,
            };
        });
        return result;
    },
    dateFormat: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dateFormatOptions = (_fieldsSchema.dateFormat?.options ?? {}) as DateFormatOptions;


        if (dateFormatOptions?.default) {
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
        const groupByOptions = (_fieldsSchema.groupBy?.options ?? {}) as _GroupByOptions;

        const result = widgetFieldDefaultValueMap.categoryBy;

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[groupByOptions.dataTarget] ?? {}));

        result.data = groupByOptions.multiSelectable ? [fieldKeys?.[0]] : fieldKeys?.[0];

        if (!groupByOptions.hideCount) {
            result.count = groupByOptions.defaultMaxCount ? groupByOptions.defaultMaxCount : 5;
        }

        return result;
    },
    header: () => widgetFieldDefaultValueMap.header,
    icon: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const iconOptions = (_fieldsSchema.icon?.options ?? {}) as IconOptions;

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
    legend: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const legendOptions = (_fieldsSchema.legend?.options ?? {}) as _LegendOptions;

        const initialValue = widgetFieldDefaultValueMap.legend;

        if (legendOptions.toggle) {
            return {
                toggleValue: true,
                position: legendOptions.showPositionField ? initialValue.position : undefined,
            };
        }
        return undefined;
    },
    max: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const maxOptions = (_fieldsSchema.max?.options ?? {}) as MaxOptions;

        if (maxOptions.default !== undefined) {
            return {
                max: maxOptions.default,
            };
        }
        return widgetFieldDefaultValueMap.max;
    },
    min: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const minOptions = (_fieldsSchema.min?.options ?? {}) as MinOptions;

        if (minOptions.default !== undefined) {
            return {
                min: minOptions.default,
            };
        }
        return widgetFieldDefaultValueMap.min;
    },
    missingValue: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const missingValueOptions = (_fieldsSchema.missingValue?.options ?? {}) as MissingValueOptions;

        if (missingValueOptions.default) {
            return {
                type: missingValueOptions.default,
            };
        }
        return widgetFieldDefaultValueMap.missingValue;
    },
    numberFormat: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const numberFormatOptions = (_fieldsSchema.numberFormat?.options ?? {}) as NumberFormatOptions;

        const dataKeys = Object.keys(dataTable?.data_info ?? {}) as string[];

        const result: NumberFormatValue = widgetFieldDefaultValueMap.numberFormat;
        dataKeys.forEach((key) => {
            result[key] = {
                format: numberFormatOptions.default ?? NUMBER_FORMAT.AUTO,
            };
        });
        return result;
    },
    pieChartType: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const pieChartTypeOptions = (_fieldsSchema.pieChartType?.options ?? {}) as PieChartTypeOptions;

        if (pieChartTypeOptions.default) {
            return {
                type: pieChartTypeOptions.default,
            };
        }

        return widgetFieldDefaultValueMap.pieChartType;
    },
    subTotal: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const subTotalOptions = (_fieldsSchema.subTotal?.options ?? {}) as SubTotalOptions;

        if (subTotalOptions.toggle) {
            return {
                toggleValue: true,
                freeze: subTotalOptions.default ?? false,
            };
        }

        return widgetFieldDefaultValueMap.subTotal;
    },
    total: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const totalOptions = (_fieldsSchema.total?.options ?? {}) as TotalOptions;

        if (totalOptions.toggle) {
            return {
                toggleValue: true,
                freeze: totalOptions.default ?? false,
            };
        }

        return widgetFieldDefaultValueMap.total;
    },
    tableColumnWidth: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const tableColumnWidthOptions = (_fieldsSchema.tableColumnWidth?.options ?? {}) as TableColumnWidthOptions;

        const initalValue = widgetFieldDefaultValueMap.tableColumnWidth;

        if (tableColumnWidthOptions.defaultMinimumWidth || tableColumnWidthOptions.defaultFixedWidth) {
            return {
                minimumWidth: tableColumnWidthOptions.defaultMinimumWidth ? tableColumnWidthOptions.defaultMinimumWidth : initalValue.minimumWidth,
                widthType: tableColumnWidthOptions?.defaultFixedWidth ? 'fixed' : 'auto',
                fixedWidth: tableColumnWidthOptions?.defaultFixedWidth,
            };
        }
        return initalValue;
    },
    textWrap: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const textWrapWidthOptions = (_fieldsSchema.textWrap?.options ?? {}) as TextWrapOptions;

        if (textWrapWidthOptions.toggle) {
            return {
                toggleValue: true,
            };
        }
        return widgetFieldDefaultValueMap.textWrap;
    },
    tooltipNumberFormat: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const tooltipNumberFormatOptions = (_fieldsSchema.tooltipNumberFormat?.options ?? {}) as TooltipNumberFormatOptions;

        if (tooltipNumberFormatOptions.default) {
            return {
                toggleValue: true,
            };
        }
        return widgetFieldDefaultValueMap.tooltipNumberFormat;
    },
    widgetHeight: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const widgetHeightOptions = (_fieldsSchema.widgetHeight?.options ?? {}) as WidgetHeightOptions;

        if (widgetHeightOptions.default) {
            return {
                type: widgetHeightOptions.default,
            };
        }
        return widgetFieldDefaultValueMap.widgetHeight;
    },
};
