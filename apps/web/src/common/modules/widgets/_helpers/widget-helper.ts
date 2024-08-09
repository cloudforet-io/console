import bytes from 'bytes';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { byteFormatter, customNumberFormatter, numberFormatter } from '@cloudforet/utils';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { DataTableGetParameters } from '@/schema/dashboard/public-data-table/api-verbs/get';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { NUMBER_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { NumberFormatValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';


export const getWidgetDataTable = async (dataTableId: string): Promise<PrivateDataTableModel|PublicDataTableModel|undefined> => {
    const isPrivate = dataTableId.startsWith('private-');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateDataTable.get<DataTableGetParameters, PrivateDataTableModel>
        : SpaceConnector.clientV2.dashboard.publicDataTable.get<DataTableGetParameters, PublicDataTableModel>;
    try {
        const result = await fetcher({ data_table_id: dataTableId });
        return result;
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

export const sortWidgetTableFields = (fields: string[]) => {
    const priorityFields = Object.values(DATE_FIELD) as string[];
    const prioritySet = new Set(priorityFields);

    const priority = fields.filter((field) => prioritySet.has(field));
    const others = fields.filter((field) => !prioritySet.has(field));

    const sortedPriority = priorityFields.filter((field) => priority.includes(field));

    return [...sortedPriority, ...others];
};

/* Widget Number Format */
export const getFormattedNumber = (val: number, dataField: string, numberFormatValue?: NumberFormatValue, unit?: string): string => {
    if (!numberFormatValue) return numberFormatter(val) || '--';
    const _targetNumberFormat = numberFormatValue[dataField];
    switch (_targetNumberFormat?.format) {
    case NUMBER_FORMAT.AUTO:
        if (unit && SIZE_UNITS.includes(unit)) {
            const _originalVal = bytes.parse(`${val}${unit}`);
            return byteFormatter(_originalVal);
        }
        return numberFormatter(val, { notation: 'compact' }) || '--';
    case NUMBER_FORMAT.SHORT_NUMBER:
        return numberFormatter(val, { notation: 'compact' }) || '--';
    case NUMBER_FORMAT.FULL_NUMBER:
        return val.toString();
    case NUMBER_FORMAT.CUSTOM:
        if (!_targetNumberFormat.customNumberFormat) return val.toString();
        return customNumberFormatter(_targetNumberFormat.customNumberFormat, val) || '--';
    default:
        return val.toString();
    }
};
