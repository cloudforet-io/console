import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { TableDataFieldValue, WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';



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
 * Line Chart
 * Data Field -> Table Data Field
 * Legend: value type is changed
 */
const _migrateLineChart = (widget: PublicWidgetModel|PrivateWidgetModel): [boolean, WidgetOptions] => {
    let _options = cloneDeep(widget.options);
    let _needMigration = false;
    if (_options.dataField && typeof _options.dataField === 'string') { // legacy case
        _needMigration = true;
        if (_options.lineBy?.value) {
            _options = {
                ..._options,
                tableDataField: {
                    fieldType: 'dynamicField',
                    value: _options.lineBy.value,
                    dynamicFieldValue: [],
                    criteria: _options.dataField,
                } as TableDataFieldValue,
            };
        } else {
            _options = {
                ..._options,
                tableDataField: {
                    fieldType: 'staticField',
                    value: [_options.dataField],
                } as TableDataFieldValue,
            };
        }
        delete _options.dataField;
        delete _options.lineBy;
    }
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
 * Data Field -> Table Data Field
 */
const _migrateClusteredColumnChart = (widget: PublicWidgetModel|PrivateWidgetModel): [boolean, WidgetOptions] => {
    let _options: WidgetOptions = cloneDeep(widget.options);
    let _needMigration = false;
    if (_options.dataField && Array.isArray(_options.dataField)) { // legacy case
        _needMigration = true;
        _options = {
            ..._options,
            tableDataField: {
                fieldType: 'staticField',
                value: _options.dataField,
            } as TableDataFieldValue,
        };
        delete _options.dataField;
    }
    return [_needMigration, _options];
};


export const migrateLegacyWidgetOptions = async (dashboardWidgets: Array<PublicWidgetModel|PrivateWidgetModel>): Promise<boolean> => {
    let isMigrated = false;
    await Promise.all(dashboardWidgets.map(async (widget) => {
        if (widget.widget_type === 'lineChart') {
            const [_needMigration, _migratedOptions] = _migrateLineChart(widget);
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
        if (widget.widget_type === 'clusteredColumnChart') {
            const [_needMigration, _migratedOptions] = _migrateClusteredColumnChart(widget);
            isMigrated = isMigrated || _needMigration;
            if (_needMigration) await updateWidget(widget.widget_id, _migratedOptions);
        }
    }));
    return isMigrated;
};
