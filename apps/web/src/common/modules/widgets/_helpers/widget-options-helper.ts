import { cloneDeep, isArray } from 'lodash';

import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';

import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { integrateFieldsSchema } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { widgetFieldDefaultValueSetterRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/default-value-registry';
import { WIDGET_OPTIONS_AFFECTED_BY_DATA_TABLE, widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetType } from '@/common/modules/widgets/types/widget-model';

export const sanitizeWidgetOptions = (options: WidgetModel['options'] = {} as WidgetModel['options'], widgetType: WidgetType = 'table', dataTable?: DataTableModel): WidgetModel['options'] => {
    const currentOptionKeys = Object.keys(options ?? {});
    const widgetConfig = getWidgetConfig(widgetType);
    const _fieldsSchema = integrateFieldsSchema(widgetConfig?.requiredFieldsSchema ?? {}, widgetConfig?.optionalFieldsSchema ?? {});
    const validOptionKeys = [
        ...Object.keys(_fieldsSchema),
        'widgetHeader',
    ];

    if (!widgetConfig) return options;

    // Remove keys that are not in the validOptionKeys list
    currentOptionKeys.forEach((key) => {
        const fieldValue = cloneDeep(options[key]).value;
        if (!validOptionKeys.includes(key)) {
            delete options[key];
        }

        const validator = widgetValidatorRegistry[key];
        const isFieldAffectedByDataTable = WIDGET_OPTIONS_AFFECTED_BY_DATA_TABLE.includes(key);

        if (!validOptionKeys.includes(key) || !dataTable || !fieldValue || !validator || !isFieldAffectedByDataTable) return;

        const fieldOptions = _fieldsSchema[key]?.options ?? {};
        if (!validator(fieldValue, widgetConfig, dataTable, options)) {
            const availableFieldKeys = Object.keys(dataTable?.[fieldOptions?.dataTarget || 'data_info'] ?? {});
            if (key === 'dataField') {
                const isMultiSelectable = fieldOptions?.multiSelectable;
                const originalData = fieldValue.data;
                const filteredData = isArray(originalData) ? originalData.filter((val) => availableFieldKeys.includes(val)) : [];
                const getSingleValue = (data) => (availableFieldKeys.includes(data) ? data : availableFieldKeys[0]);

                const isPivotDataTable = dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT;
                if (isPivotDataTable) {
                    const pivotColumnsField = dataTable?.options.PIVOT?.fields?.column; // string;
                    options[key] = {
                        value: {
                            ...fieldValue,
                            data: isMultiSelectable ? [pivotColumnsField] : pivotColumnsField,
                        },
                    };
                } else {
                    options[key] = {
                        value: {
                            ...fieldValue,
                            data: isMultiSelectable ? filteredData : getSingleValue(originalData),
                        },
                    };
                }
            }
            if (key === 'groupBy') {
                const isMultiSelectable = fieldOptions?.multiSelectable;
                const originalData = fieldValue.data;
                const filteredData = isArray(originalData) ? originalData.filter((val) => availableFieldKeys.includes(val)) : [];
                const hideCount = fieldOptions?.hideCount;
                const getSingleValue = (data) => (availableFieldKeys.includes(data) ? data : availableFieldKeys[0]);

                options[key] = {
                    value: {
                        count: !hideCount ? (fieldValue.count ?? fieldOptions.defaultMaxCount ?? 5) : undefined,
                        data: isMultiSelectable ? filteredData : getSingleValue(originalData),
                    },
                };
            }
            if (key === 'categoryBy' || key === 'stackBy' || key === 'xAxis' || key === 'yAxis') {
                if (!availableFieldKeys.includes(fieldValue.data)) {
                    options[key] = { value: { ...fieldValue, data: availableFieldKeys[0] } };
                }
            }
            if (key === 'sankeyDimensions') {
                options[key] = {
                    value: {
                        ...fieldValue,
                        data: fieldValue.data?.filter((val) => availableFieldKeys.includes(val)) || [],
                    },
                };
            }
            if (key === 'formatRules' && fieldOptions.useField) {
                if (!availableFieldKeys.includes(fieldValue.field)) {
                    options[key] = {
                        value: {
                            ...fieldValue,
                            field: availableFieldKeys[0],
                        },
                    };
                }
            }
            if (key === 'customTableColumnWidth') {
                const _availableFieldKeys = [...Object.keys(dataTable?.labels_info ?? {}), ...Object.keys(dataTable?.data_info ?? {})];
                options[key] = {
                    value: {
                        widthInfos: fieldValue.widthInfos?.filter((widthInfo) => _availableFieldKeys.includes(widthInfo.fieldKey)) || [],
                    },
                };
            }
            if (key === 'tableColumnComparison') {
                options[key] = {
                    value: {
                        ...fieldValue,
                        fields: fieldValue.fields?.filter((field) => availableFieldKeys.includes(field)) || [],
                    },
                };
            }
        }
    });

    validOptionKeys.forEach((key) => {
        const fieldValue = cloneDeep(options[key])?.value;
        if (!fieldValue) {
            const defaultValueSetter = widgetFieldDefaultValueSetterRegistry[key];
            if (defaultValueSetter) {
                options[key] = { value: defaultValueSetter(widgetConfig, dataTable) };
            }
        }
    });

    return options;
};
