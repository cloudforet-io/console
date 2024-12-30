import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { SERVICE_CHANNEL_STATE } from '@/schema/alert-manager/service-channel/constants';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import type { AlertManagementTableHandlerType } from '@/services/alert-manager/types/alert-manager-type';

export const NOTIFICATION_MANAGEMENT_TABLE_FIELDS: DataTableFieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'protocol_id', label: 'Channel' },
    { name: 'state', label: 'State' },
];
export const NOTIFICATION_MANAGEMENT_TABLE_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.ServiceChannel', 'name'),
        state: makeEnumValueHandler(SERVICE_CHANNEL_STATE),
    },
};
export const ALERT_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'protocol_id', name: 'Channel' },
    { key: 'state', name: 'State' },
];
