import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { TableDataFieldValueNoVersion, TableDataFieldValueV1 } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import { LATEST_TABLE_DATA_FIELD_VERSION } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type {
    WidgetFieldValues,
} from '@/common/modules/widgets/types/widget-field-value-type';



type WidgetOptions = Record<WidgetFieldName, WidgetFieldValues>;

const updateWidget = async (widgetId: string, options: WidgetOptions) => {
    const isPrivate = widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
    try {
        await fetcher({
            widget_id: widgetId,
            options,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/**
 * XY Chart (Line Chart, Area Chart, Column Chart)
 * Data Field & Group by -> Table Data Field V1
 * Table Data Field No Version -> Table Data Field V1
 * Legend: value type is changed
 */
const _migrateXYChart = (widget: PublicWidgetModel|PrivateWidgetModel, groupByField: string): [boolean, WidgetOptions] => {
    let _options = cloneDeep(widget.options);
    let _needMigration = false;

    const _dataFieldToTableDataFieldV1 = () => {
        _needMigration = true;
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
        _needMigration = true;
        _options = {
            ..._options,
            tableDataField: migrateTableDataField(_options.tableDataField),
        };
    };
    if ('dataField' in _options) {
        _dataFieldToTableDataFieldV1();
    } else if (_options.tableDataField
        && (!('version' in _options.tableDataField) || _options.tableDataField.version !== LATEST_TABLE_DATA_FIELD_VERSION)) {
        _tableDataFieldNoVersionToTableDataFieldV1();
    }

    // Legend version migration
    // no version
    if (_options.legend && !_options.legend?.toggleValue) {
        _options = {
            ..._options,
            legend: {
                toggleValue: true,
            },
        };
    }
    return [_needMigration, _options];
};

/**
 * Clustered Column Chart
 * Data Field -> Table Data Field V1
 * Table Data Field No Version -> Table Data Field V1
 */
const _migrateClusteredColumnChart = (widget: PublicWidgetModel|PrivateWidgetModel): [boolean, WidgetOptions] => {
    let _options: WidgetOptions = cloneDeep(widget.options);
    let _needMigration = false;

    const _dataFieldToTableDataFieldV1 = () => {
        _needMigration = true;
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
        _needMigration = true;
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
    return [_needMigration, _options];
};

/**
 * Heatmap
 * Data Field & YAxis -> Table Data Field V1
 */
const _migrateHeatmap = (widget: PublicWidgetModel|PrivateWidgetModel): [boolean, WidgetOptions] => {
    let _options: WidgetOptions = cloneDeep(widget.options);
    let _needMigration = false;

    const _dataFieldToTableDataFieldV1 = () => {
        _needMigration = true;
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
    return [_needMigration, _options];
};

/**
 * Table
 * Table Data Field No Version -> Table Data Field V1
 */
const migrateTable = (widget: PublicWidgetModel|PrivateWidgetModel): [boolean, WidgetOptions] => {
    let _options: WidgetOptions = cloneDeep(widget.options);
    let _needMigration = false;
    // Table Data Field version migration
    if (_options.tableDataField
        && (!('version' in _options.tableDataField) || _options.tableDataField.version !== LATEST_TABLE_DATA_FIELD_VERSION)) {
        _needMigration = true;
        _options = {
            ..._options,
            tableDataField: migrateTableDataField(_options.tableDataField),
        };
    }
    return [_needMigration, _options];
};


export const migrateLegacyWidgetOptions = async (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>): Promise<boolean> => {
    let isMigrated = false;
    await Promise.all(dashboardWidgets.map(async (widget) => {
        if (widget.widget_type === 'lineChart' || widget.widget_type === 'stackedAreaChart') {
            const [_needMigration, _migratedOptions] = _migrateXYChart(widget, 'lineBy');
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
        if (widget.widget_type === 'stackedColumnChart' || widget.widget_type === 'stackedHorizontalBarChart') {
            const [_needMigration, _migratedOptions] = _migrateXYChart(widget, 'stackBy');
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
        if (widget.widget_type === 'clusteredColumnChart') {
            const [_needMigration, _migratedOptions] = _migrateClusteredColumnChart(widget);
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
        if (widget.widget_type === 'heatmap') {
            const [_needMigration, _migratedOptions] = _migrateHeatmap(widget);
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
        if (widget.widget_type === 'table') {
            const [_needMigration, _migratedOptions] = migrateTable(widget);
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
    }));
    return isMigrated;
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
