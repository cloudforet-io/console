import { every } from 'lodash';

import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { FieldValueValidator } from '@/common/modules/widgets/_widget-field-value-manager/type';
import type { CategoryByValue, CategoryByOptions } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldOptions, DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import { DAILY_ENABLED_VALUES, MONTHLY_ENABLED_VALUES, YEARLY_ENABLED_VALUES } from '@/common/modules/widgets/_widget-fields/date-range/constant';
import { checkInvalidCustomValue } from '@/common/modules/widgets/_widget-fields/date-range/helper';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplayAnnotationValue } from '@/common/modules/widgets/_widget-fields/display-annotation/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { FormatRulesOptions, FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByOptions, GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import { ICON_FIELD_ITEMS } from '@/common/modules/widgets/_widget-fields/icon/constant';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { MaxValue } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinValue } from '@/common/modules/widgets/_widget-fields/min/type';
import type { SankeyDimensionsOptions, SankeyDimensionsValue } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { StackByValue, StackByOptions } from '@/common/modules/widgets/_widget-fields/stack-by/type';
import type { TableColumnComparisonValue } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { XAxisValue, XAxisOptions } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { YAxisValue, YAxisOptions } from '@/common/modules/widgets/_widget-fields/y-axis/type';

export interface WidgetValidatorRegistry {
    [fieldKey: string]: FieldValueValidator<any>;
}

const isValidSelectionList = (baseList: string[], selectedList?: string[]): boolean => {
    if (!selectedList) return false;
    return every(selectedList, (item) => baseList.includes(item));
};

export const WIDGET_OPTIONS_AFFECTED_BY_DATA_TABLE = [
    'dataField',
    'formatRules',
    'groupBy',
    'stackBy',
    'xAxis',
    'yAxis',
    'categoryBy',
    'sankeyDimensions',
    'customTableColumnWidth',
    'tableColumnComparison',
];

export const widgetValidatorRegistry: WidgetValidatorRegistry = {
    dateRange: (fieldValue: DateRangeValue, widgetConfig, dataTable, allValueMap) => {
        const _dateRangeType = fieldValue.options?.value;
        const _granularity = allValueMap?.granularity?.value?.granularity;
        if (!_dateRangeType || !_granularity) return false;
        if (checkInvalidCustomValue(fieldValue, _granularity).invalid) return false;
        if (_granularity === 'MONTHLY' && !MONTHLY_ENABLED_VALUES.includes(_dateRangeType)) return false;
        if (_granularity === 'DAILY' && !DAILY_ENABLED_VALUES.includes(_dateRangeType)) return false;
        if (_granularity === 'YEARLY' && !YEARLY_ENABLED_VALUES.includes(_dateRangeType)) return false;

        return true;
    },
    dataField: (fieldValue: DataFieldValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const dataFieldOptions = (_fieldsSchema.dataField?.options ?? {}) as DataFieldOptions;
        const isPivotDataTable = dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
        const multiSelectable = dataFieldOptions.multiSelectable;
        const availableFieldKeys = Object.keys(dataTable?.data_info ?? {});

        if (isPivotDataTable) {
            const pivotColumnsField = dataTable?.options.PIVOT?.fields?.column;
            if (!pivotColumnsField) return false;
            if (multiSelectable) {
                return Array.isArray(fieldValue.data) && !!fieldValue.data.length && isValidSelectionList([pivotColumnsField], fieldValue.data);
            }
            return fieldValue.data === pivotColumnsField;
        }

        if (dataFieldOptions.multiSelectable) {
            const value = fieldValue.data as string[]|undefined;
            return Array.isArray(value) && !!value.length && isValidSelectionList(availableFieldKeys, value);
        }

        const value = fieldValue.data as string|undefined;
        return !!value && availableFieldKeys.includes(value);
    },
    formatRules: (fieldValue: FormatRulesValue, widgetConfig, dataTable, allValueMap) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const formatRulesOptions = (_fieldsSchema.formatRules?.options ?? {}) as FormatRulesOptions;
        const availableFieldKeys = Object.keys(dataTable?.[formatRulesOptions?.dataTarget ?? 'labels_info'] ?? {});
        const type = formatRulesOptions.formatRulesType;

        if (formatRulesOptions.useField) {
            if (fieldValue.field && !availableFieldKeys.includes(fieldValue.field)) return false;
            if (formatRulesOptions.dependentField) {
                const dependentValue: string|string[]|undefined = allValueMap?.[formatRulesOptions.dependentField]?.value?.data;
                if (!dependentValue) return !!fieldValue.field;
                if (Array.isArray(dependentValue)) {
                    return typeof fieldValue.field === 'string' && !dependentValue.includes(fieldValue.field);
                }
                return dependentValue !== fieldValue.field;
            }
            return !!fieldValue.field;
        }
        if (type === FORMAT_RULE_TYPE.textThreshold) {
            return fieldValue.rules.every((d) => !!d.text && !!d.color);
        }
        if (type === FORMAT_RULE_TYPE.numberThreshold || type === FORMAT_RULE_TYPE.percentThreshold) {
            return fieldValue.rules.every((d) => !!d.number && !!d.color);
        }
        if (type === FORMAT_RULE_TYPE.textNumberThreshold) {
            return fieldValue.rules.every((d) => !!d.text && !!d.number && !!d.color);
        }
        return true;
    },
    categoryBy: (fieldValue: CategoryByValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const categoryByOptions = (_fieldsSchema.categoryBy?.options ?? {}) as CategoryByOptions;
        const availableFieldKeys = Object.keys(dataTable?.[categoryByOptions?.dataTarget ?? 'labels_info'] ?? {});

        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0
            || fieldValue.count > categoryByOptions.max || !availableFieldKeys.includes(fieldValue.data)) return false;
        return true;
    },
    stackBy: (fieldValue: StackByValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const stackByOptions = (_fieldsSchema.stackBy?.options ?? {}) as StackByOptions;
        const availableFieldKeys = Object.keys(dataTable?.[stackByOptions?.dataTarget ?? 'labels_info'] ?? {});

        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0
            || fieldValue.count > stackByOptions.max || !availableFieldKeys.includes(fieldValue.data)) return false;
        return true;
    },
    xAxis: (fieldValue: XAxisValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const xAxisOptions = (_fieldsSchema.xAxis?.options ?? {}) as XAxisOptions;
        const availableFieldKeys = Object.keys(dataTable?.[xAxisOptions?.dataTarget ?? 'labels_info'] ?? {});

        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0
            || fieldValue.count > xAxisOptions.max || !availableFieldKeys.includes(fieldValue.data)) return false;
        return true;
    },
    yAxis: (fieldValue: YAxisValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const yAxisOptions = (_fieldsSchema.yAxis?.options ?? {}) as YAxisOptions;
        const availableFieldKeys = Object.keys(dataTable?.[yAxisOptions?.dataTarget ?? 'labels_info'] ?? {});

        if (!fieldValue.data || !fieldValue.count || fieldValue.count < 0
            || fieldValue.count > yAxisOptions.max || !availableFieldKeys.includes(fieldValue.data)) return false;
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
    tableColumnComparison: (fieldValue: TableColumnComparisonValue, widgetConfig, dataTable) => {
        const availableFieldKeys = Object.keys(dataTable?.data_info ?? {});

        if (fieldValue.toggleValue) {
            return !!fieldValue.decreaseColor && !!fieldValue.increaseColor && !!fieldValue.format
                && !!fieldValue.fields?.length && isValidSelectionList(availableFieldKeys, fieldValue.fields);
        }
        return true;
    },
    customTableColumnWidth: (fieldValue: CustomTableColumnWidthValue, widgetConfig, dataTable) => {
        const availableFieldKeys = [...Object.keys(dataTable?.labels_info ?? {}), ...Object.keys(dataTable?.data_info ?? {})];



        if (fieldValue.widthInfos?.length) {
            return fieldValue.widthInfos.every((d) => !!d.fieldKey && d.width >= 0)
                && fieldValue.widthInfos.map((d) => d.fieldKey).length === new Set(fieldValue.widthInfos.map((d) => d.fieldKey)).size
                && isValidSelectionList(availableFieldKeys, fieldValue.widthInfos.map((d) => d.fieldKey));
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
    groupBy: (fieldValue: GroupByValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const groupByOptions = (_fieldsSchema.groupBy?.options ?? {}) as GroupByOptions;
        const availableFieldKeys = Object.keys(dataTable?.[groupByOptions?.dataTarget ?? 'labels_info'] ?? {});

        if (groupByOptions.hideCount && !!fieldValue.count) return false;
        if (!groupByOptions.hideCount && groupByOptions.max && groupByOptions.defaultMaxCount && (!fieldValue.count || fieldValue.count > groupByOptions.max)) return false;
        if (groupByOptions.multiSelectable) {
            if (!Array.isArray(fieldValue.data)) return false;
            if (!isValidSelectionList(availableFieldKeys, fieldValue.data as string[]|undefined)) return false;
            if (groupByOptions.excludeDateField && fieldValue.data.includes('Date')) return false;
            if (groupByOptions.fixedValue && !fieldValue.data.includes(groupByOptions.fixedValue)) return false;
            return !!fieldValue.data;
        }
        if (groupByOptions.excludeDateField && fieldValue.data === 'Date') return false;
        if (groupByOptions.fixedValue && fieldValue.data !== groupByOptions.fixedValue) return false;
        return !!fieldValue.data && availableFieldKeys.includes(fieldValue.data as string);
    },
    sankeyDimensions: (fieldValue: SankeyDimensionsValue, widgetConfig, dataTable) => {
        const _fieldsSchema = integrateFieldsSchema(widgetConfig.requiredFieldsSchema, widgetConfig.optionalFieldsSchema);
        const sankeyDimensionsOptions = (_fieldsSchema.sankeyDimensions?.options ?? {}) as SankeyDimensionsOptions;
        const availableFieldKeys = Object.keys(dataTable?.labels_info ?? {});


        if (!fieldValue.data || fieldValue.data.length !== 2 || !fieldValue.count
            || fieldValue.count > sankeyDimensionsOptions.max || isValidSelectionList(availableFieldKeys, fieldValue.data)) return false;
        return true;
    },
    widgetHeader: (fieldValue: WidgetHeaderValue) => {
        if (!fieldValue.toggleValue) return true;
        return !!fieldValue.title?.trim();
    },
    icon: (fieldValue: IconValue) => {
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
    numberFormat: () => true,
    pieChartType: () => true,
    subTotal: () => true,
    total: () => true,
    tableColumnWidth: (fieldValue: TableColumnWidthValue) => {
        if (!fieldValue.minimumWidth) return false;
        if (fieldValue.widthType === 'fixed') {
            if (!fieldValue.fixedWidth) return false;
            if (fieldValue.fixedWidth < fieldValue.minimumWidth) return false;
        }
        return true;
    },
    textWrap: () => true,
    tooltipNumberFormat: () => true,
    widgetHeight: () => true,
};


