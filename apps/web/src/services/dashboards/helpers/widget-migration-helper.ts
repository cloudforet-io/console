import { cloneDeep } from 'lodash';


import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { WidgetHeaderValue } from '@/common/modules/widgets/_widget-fields/header/type';
import type {
    TableDataFieldValueNoVersion,
    TableDataFieldValueV1,
} from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import { LATEST_TABLE_DATA_FIELD_VERSION } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';


type WidgetOptions = Record<WidgetFieldName, WidgetFieldValues>;

/**
 * XY Chart (Line Chart, Area Chart, Column Chart)
 * Data Field & Group by -> Table Data Field V1
 * Table Data Field No Version -> Table Data Field V1
 * Legend: value type is changed
 */
const _migrateXYChart = (widget: PublicWidgetModel|PrivateWidgetModel, groupByField: string): PublicWidgetModel|PrivateWidgetModel => {
    let _options = cloneDeep(widget.options);

    const _dataFieldToTableDataFieldV1 = () => {
        if (_options?.[groupByField]?.value) {
            _options = {
                ..._options,
                tableDataField: {
                    fieldType: 'dynamicField',
                    dynamicFieldInfo: {
                        criteria: _options.dataField,
                        fieldValue: _options[groupByField].value,
                        valueType: 'auto',
                        count: _options?.[groupByField]?.count || 5,
                    },
                    version: 'v1',
                } as TableDataFieldValueV1,
            };
        } else {
            _options = {
                ..._options,
                tableDataField: {
                    fieldType: 'staticField',
                    staticFieldInfo: {
                        fieldValue: [_options.dataField],
                    },
                    version: 'v1',
                } as TableDataFieldValueV1,
            };
        }
        delete _options?.dataField;
        delete _options?.[groupByField];
    };
    const _tableDataFieldNoVersionToTableDataFieldV1 = () => {
        _options = {
            ..._options,
            tableDataField: migrateTableDataField(_options.tableDataField),
        };
    };
    if ('dataField' in _options) {
        _dataFieldToTableDataFieldV1();
    } else if (_options?.tableDataField
        && (!('version' in _options.tableDataField) || _options.tableDataField.version !== LATEST_TABLE_DATA_FIELD_VERSION)) {
        _tableDataFieldNoVersionToTableDataFieldV1();
    }

    // Legend version migration
    // no version
    if (_options?.legend && !_options.legend?.toggleValue) {
        _options = {
            ..._options,
            legend: {
                toggleValue: true,
            },
        };
    }
    return {
        ...widget,
        options: _options,
    };
};

/**
 * Clustered Column Chart
 * Data Field -> Table Data Field V1
 * Table Data Field No Version -> Table Data Field V1
 */
const _migrateClusteredColumnChart = (widget: PublicWidgetModel|PrivateWidgetModel): PublicWidgetModel|PrivateWidgetModel => {
    let _options: WidgetOptions = cloneDeep(widget.options);

    const _dataFieldToTableDataFieldV1 = () => {
        _options = {
            ..._options,
            tableDataField: {
                fieldType: 'staticField',
                staticFieldInfo: {
                    fieldValue: _options.dataField,
                },
                version: 'v1',
            },
        };
        delete _options?.dataField;
    };
    const _tableDataFieldNoVersionToTableDataFieldV1 = () => {
        _options = {
            ..._options,
            tableDataField: migrateTableDataField(_options.tableDataField),
        };
    };
    if ('dataField' in _options) {
        _dataFieldToTableDataFieldV1();
    } else if ('tableDataField' in _options
        && (!('version' in _options.tableDataField) || _options.tableDataField.version !== LATEST_TABLE_DATA_FIELD_VERSION)) {
        _tableDataFieldNoVersionToTableDataFieldV1();
    }
    return {
        ...widget,
        options: _options,
    };
};

/**
 * Heatmap
 * Data Field & YAxis -> Table Data Field V1
 */
const _migrateHeatmap = (widget: PublicWidgetModel|PrivateWidgetModel): PublicWidgetModel|PrivateWidgetModel => {
    let _options: WidgetOptions = cloneDeep(widget.options);

    const _dataFieldToTableDataFieldV1 = () => {
        _options = {
            ..._options,
            tableDataField: {
                fieldType: 'dynamicField',
                dynamicFieldInfo: {
                    criteria: _options.dataField,
                    fieldValue: _options.yAxis?.value,
                    valueType: 'auto',
                    count: _options.yAxis?.count || 7,
                },
                version: 'v1',
            } as TableDataFieldValueV1,
        };
        delete _options?.dataField;
        delete _options?.yAxis;
    };

    if ('dataField' in _options) {
        _dataFieldToTableDataFieldV1();
    }
    return {
        ...widget,
        options: _options,
    };
};

/**
 * Table
 * Table Data Field No Version -> Table Data Field V1
 */
const migrateTable = (widget: PublicWidgetModel|PrivateWidgetModel): PublicWidgetModel|PrivateWidgetModel => {
    let _options: WidgetOptions = cloneDeep(widget.options);
    // Table Data Field version migration
    if (_options?.tableDataField
        && (!('version' in _options.tableDataField) || _options.tableDataField.version !== LATEST_TABLE_DATA_FIELD_VERSION)) {
        _options = {
            ..._options,
            tableDataField: migrateTableDataField(_options.tableDataField),
        };
    }
    return {
        ...widget,
        options: _options,
    };
};

/*
* All Widgets
* Widget Header: set toggleValue to true if widgetHeader exists but toggleValue is missing
*/
const migrateAllWidgets = (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>): Array<PublicWidgetModel|PrivateWidgetModel> => {
    const _migratedWidgets: Array<PublicWidgetModel|PrivateWidgetModel> = cloneDeep(dashboardWidgets);
    _migratedWidgets.forEach((widget) => {
        // Widget Header
        const _widgetOptions: WidgetOptions = cloneDeep(widget?.options);
        const _widgetHeaderOption = cloneDeep(widget?.options?.widgetHeader) as WidgetHeaderValue;
        if (_widgetHeaderOption && (_widgetHeaderOption?.toggleValue === undefined)) {
            widget.options = {
                ..._widgetOptions,
                widgetHeader: {
                    ..._widgetHeaderOption,
                    toggleValue: true,
                },
            };
        }
        // Date Range
        /* History
        * Migration note: For existing non-table widgets, apply the current year/month/day date range
        * instead of the 'auto' policy. This migration only affects legacy widgets, as newer non-table
        * widgets are already configured with specific date ranges based on granularity (e.g., 'DAILY' -> 'today').
        * */
        const _widgetDateRangeOption = cloneDeep(widget?.options?.dateRange) as DateRangeValue;
        if (_widgetDateRangeOption === undefined) {
            const granularity = widget.options?.granularity as string;
            const granularityDefaults: Record<string, DateRangeValue['options']['value']> = {
                DAILY: 'today',
                MONTHLY: 'thisMonth',
                YEARLY: 'thisYear',
            };

            const defaultDateRangePresetKey = granularityDefaults[granularity] || 'auto';

            widget.options = {
                ..._widgetOptions,
                dateRange: {
                    inherit: true,
                    options: {
                        value: widget.widget_type === 'table' ? 'auto' : defaultDateRangePresetKey,
                    },
                },
            };
        }
    });
    return _migratedWidgets;
};


export const migrateLegacyWidgetOptions = (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>): Array<PublicWidgetModel|PrivateWidgetModel> => {
    // let isMigrated = false;
    let migratedWidgets = dashboardWidgets.map((widget) => {
        if (widget.widget_type === 'lineChart' || widget.widget_type === 'stackedAreaChart') {
            return _migrateXYChart(widget, 'lineBy');
        }
        if (widget.widget_type === 'stackedColumnChart' || widget.widget_type === 'stackedHorizontalBarChart') {
            return _migrateXYChart(widget, 'stackBy');
        }
        if (widget.widget_type === 'clusteredColumnChart') {
            return _migrateClusteredColumnChart(widget);
        }
        if (widget.widget_type === 'heatmap') {
            return _migrateHeatmap(widget);
        }
        if (widget.widget_type === 'table') {
            return migrateTable(widget);
        }
        return widget;
    });
    migratedWidgets = migrateAllWidgets(migratedWidgets);
    return migratedWidgets;
};

/** Option Migration Helper */

/** Table Data Field Migration
 * Widgets: [Table, Line Chart, Clustered Column Chart]
 * Latest Version: v1
 */
type LegacyTableDataFieldValue = TableDataFieldValueNoVersion | any;
type LatestTableDataFieldValue = TableDataFieldValueV1;
const migrateTableDataField = (tableDataField: LegacyTableDataFieldValue): LatestTableDataFieldValue => {
    switch (tableDataField.version) {
    case undefined: { // no-version -> v1
        const legacyTableDataField = tableDataField as TableDataFieldValueNoVersion;
        if (legacyTableDataField.fieldType === 'staticField') {
            const _fieldValue = legacyTableDataField.value as string[] | undefined;
            return {
                fieldType: 'staticField',
                staticFieldInfo: {
                    fieldValue: _fieldValue,
                },
                version: 'v1',
            };
        }
        const _criteria = legacyTableDataField.criteria as string;
        const _fieldValue = legacyTableDataField.value as string | undefined;
        const _dynamicFieldValue = legacyTableDataField.dynamicFieldValue as string[] | undefined;
        return {
            fieldType: 'dynamicField',
            dynamicFieldInfo: {
                criteria: _criteria,
                fieldValue: _fieldValue,
                valueType: 'fixed', // no-version's default
                fixedValue: _dynamicFieldValue,
            },
            version: 'v1',
        };
    }
    default:
        return tableDataField as LatestTableDataFieldValue;
    }
};
