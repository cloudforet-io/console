import { cloneDeep } from 'lodash';

import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import {
    COLOR_SCHEMA, DATA_FIELD_HEATMAP_COLOR, DATE_FORMAT, DEFAULT_COMPARISON_COLOR, NUMBER_FORMAT, TABLE_DEFAULT_MINIMUM_WIDTH, WIDGET_HEIGHT,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
// eslint-disable-next-line import/no-cycle
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import type { FieldDefaultValueConvertor, WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { _ColorSchemaOptions as ColorSchemaOptions } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonOptions } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DataFieldHeatmapColorOptions, DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldOptions } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatOptions } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { FormatRulesOptions } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GroupByOptions } from '@/common/modules/widgets/_widget-fields/group-by/type';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { IconOptions } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { LegendOptions } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { MaxOptions } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinOptions } from '@/common/modules/widgets/_widget-fields/min/type';
import type { MissingValueOptions } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatOptions, NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeOptions } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { SankeyDimensionsOptions } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { SubTotalOptions } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { TableColumnComparisonOptions } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
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
    tableColumnComparison: {
        decreaseColor: DEFAULT_COMPARISON_COLOR.DECREASE,
        increaseColor: DEFAULT_COMPARISON_COLOR.INCREASE,
        format: 'fixed',
        toggleValue: true,
        fields: [],
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
    widgetHeader: {
        toggleValue: true,
        title: '',
        description: '',
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
    sankeyDimensions: {
        data: [],
    },
} as const;

export type WidgetFieldDefaultValueSetterRegistry = {
    [K in keyof WidgetFieldTypeMap]: FieldDefaultValueConvertor<K>;
};

export const widgetFieldDefaultValueSetterRegistry: WidgetFieldDefaultValueSetterRegistry = {
    dataField: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldOptions = (_fieldsSchema.dataField?.options ?? {}) as DataFieldOptions;
        const multiSelectable = dataFieldOptions.multiSelectable;
        const result = cloneDeep(widgetFieldDefaultValueMap.dataField);

        const isPivotDataTable = dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
        if (isPivotDataTable) { // if pivot dataTable, always multiSelectable
            return {
                data: multiSelectable ? [dataTable?.options.PIVOT?.fields?.column] : dataTable?.options.PIVOT?.fields?.column,
            };
        }

        const fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.data_info ?? {}));

        if (multiSelectable) {
            result.data = dataFieldOptions.allSelected ? fieldKeys : [fieldKeys?.[0]];
        } else {
            result.data = fieldKeys?.[0];
        }


        return result;
    },
    formatRules: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = (_fieldsSchema.formatRules?.options ?? {}) as FormatRulesOptions;

        let result = cloneDeep(widgetFieldDefaultValueMap.formatRules);

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

        const result = cloneDeep(widgetFieldDefaultValueMap.categoryBy);

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

        const result = cloneDeep(widgetFieldDefaultValueMap.categoryBy);

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

        const result = cloneDeep(widgetFieldDefaultValueMap.categoryBy);

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

        const result = cloneDeep(widgetFieldDefaultValueMap.categoryBy);

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
        return cloneDeep(widgetFieldDefaultValueMap.colorSchema);
    },
    comparison: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const comparisonOptions = (_fieldsSchema.comparison?.options ?? {}) as ComparisonOptions;

        if (comparisonOptions.toggle) {
            return cloneDeep(widgetFieldDefaultValueMap.comparison);
        }

        return {
            toggleValue: false,
        };
    },
    tableColumnComparison: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const tableColumnComparisonOptions = (_fieldsSchema.tableColumnComparison?.options ?? {}) as TableColumnComparisonOptions;

        if (tableColumnComparisonOptions.toggle) {
            return cloneDeep(widgetFieldDefaultValueMap.tableColumnComparison);
        }

        return {
            toggleValue: false,
        };
    },
    customTableColumnWidth: () => cloneDeep(widgetFieldDefaultValueMap.customTableColumnWidth),
    dataFieldHeatmapColor: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldheatmapColorOptions = (_fieldsSchema.dataFieldHeatmapColor?.options ?? {}) as DataFieldHeatmapColorOptions;
        const isPivotDataTable = dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
        const columnFieldForPivot = dataTable?.options.PIVOT?.fields?.column as string;

        const dataKeys = Object.keys(dataTable?.data_info ?? {}) as string[];
        const fieldKeys = isPivotDataTable ? [columnFieldForPivot] : dataKeys;

        const result: DataFieldHeatmapColorValue = cloneDeep(widgetFieldDefaultValueMap.dataFieldHeatmapColor);
        fieldKeys.forEach((key) => {
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

        return cloneDeep(widgetFieldDefaultValueMap.dateFormat);
    },
    dateRange: () => cloneDeep(widgetFieldDefaultValueMap.dateRange),
    displayAnnotation: () => cloneDeep(widgetFieldDefaultValueMap.displayAnnotation),
    displaySeriesLabel: () => cloneDeep(widgetFieldDefaultValueMap.displaySeriesLabel),
    granularity: () => cloneDeep(widgetFieldDefaultValueMap.granularity),
    groupBy: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const groupByOptions = (_fieldsSchema.groupBy?.options ?? {}) as GroupByOptions;

        const result = cloneDeep(widgetFieldDefaultValueMap.groupBy);

        let fieldKeys = sortWidgetTableFields(Object.keys(dataTable?.[groupByOptions.dataTarget] ?? {}));
        if (groupByOptions.fixedValue) {
            fieldKeys = fieldKeys.filter((key) => key === groupByOptions.fixedValue);
        }

        if (fieldKeys.length === 0) {
            result.data = groupByOptions.multiSelectable ? [] : undefined;
        } else result.data = groupByOptions.multiSelectable ? [fieldKeys?.[0]] : fieldKeys?.[0];

        if (!groupByOptions.hideCount) {
            result.count = groupByOptions.defaultMaxCount ? groupByOptions.defaultMaxCount : 5;
        }

        return result;
    },
    widgetHeader: (widgetConfig) => {
        const result = cloneDeep(widgetFieldDefaultValueMap.widgetHeader);

        return {
            ...result,
            title: widgetConfig.meta.title,
        };
    },
    icon: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const iconOptions = (_fieldsSchema.icon?.options ?? {}) as IconOptions;

        const initialValue = cloneDeep(widgetFieldDefaultValueMap.icon);

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
        const legendOptions = (_fieldsSchema.legend?.options ?? {}) as LegendOptions;

        const initialValue = cloneDeep(widgetFieldDefaultValueMap.legend);

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
        return cloneDeep(widgetFieldDefaultValueMap.max);
    },
    min: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const minOptions = (_fieldsSchema.min?.options ?? {}) as MinOptions;

        if (minOptions.default !== undefined) {
            return {
                min: minOptions.default,
            };
        }
        return cloneDeep(widgetFieldDefaultValueMap.min);
    },
    missingValue: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const missingValueOptions = (_fieldsSchema.missingValue?.options ?? {}) as MissingValueOptions;

        if (missingValueOptions.default) {
            return {
                type: missingValueOptions.default,
            };
        }
        return cloneDeep(widgetFieldDefaultValueMap.missingValue);
    },
    numberFormat: (widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const numberFormatOptions = (_fieldsSchema.numberFormat?.options ?? {}) as NumberFormatOptions;
        const isPivotDataTable = dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
        const columnFieldForPivot = dataTable?.options.PIVOT?.fields?.column as string;

        const dataKeys = Object.keys(dataTable?.data_info ?? {}) as string[];
        const fieldKeys = isPivotDataTable ? [columnFieldForPivot] : dataKeys;

        const result: NumberFormatValue = cloneDeep(widgetFieldDefaultValueMap.numberFormat);
        fieldKeys.forEach((key) => {
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

        return cloneDeep(widgetFieldDefaultValueMap.pieChartType);
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

        return cloneDeep(widgetFieldDefaultValueMap.subTotal);
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

        return cloneDeep(widgetFieldDefaultValueMap.total);
    },
    tableColumnWidth: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const tableColumnWidthOptions = (_fieldsSchema.tableColumnWidth?.options ?? {}) as TableColumnWidthOptions;

        const initialValue = cloneDeep(widgetFieldDefaultValueMap.tableColumnWidth);

        if (tableColumnWidthOptions.defaultMinimumWidth || tableColumnWidthOptions.defaultFixedWidth) {
            return {
                minimumWidth: tableColumnWidthOptions.defaultMinimumWidth ? tableColumnWidthOptions.defaultMinimumWidth : initialValue.minimumWidth,
                widthType: tableColumnWidthOptions?.defaultFixedWidth ? 'fixed' : 'auto',
                fixedWidth: tableColumnWidthOptions?.defaultFixedWidth,
            };
        }
        return initialValue;
    },
    textWrap: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const textWrapWidthOptions = (_fieldsSchema.textWrap?.options ?? {}) as TextWrapOptions;

        if (textWrapWidthOptions.toggle) {
            return {
                toggleValue: true,
            };
        }
        return cloneDeep(widgetFieldDefaultValueMap.textWrap);
    },
    tooltipNumberFormat: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const tooltipNumberFormatOptions = (_fieldsSchema.tooltipNumberFormat?.options ?? {}) as TooltipNumberFormatOptions;

        if (tooltipNumberFormatOptions.default) {
            return {
                toggleValue: true,
            };
        }
        return cloneDeep(widgetFieldDefaultValueMap.tooltipNumberFormat);
    },
    widgetHeight: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const widgetHeightOptions = (_fieldsSchema.widgetHeight?.options ?? {}) as WidgetHeightOptions;

        if (widgetHeightOptions.default) {
            return {
                type: widgetHeightOptions.default,
            };
        }
        return cloneDeep(widgetFieldDefaultValueMap.widgetHeight);
    },
    sankeyDimensions: (widgetConfig) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const sankeyDimensionsOptions = (_fieldsSchema.sankeyDimensions?.options ?? {}) as SankeyDimensionsOptions;

        return {
            data: [],
            count: sankeyDimensionsOptions.defaultMaxCount,
        };
    },
};
