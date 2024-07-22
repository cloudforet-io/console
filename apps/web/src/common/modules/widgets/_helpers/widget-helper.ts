import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { DataTableGetParameters } from '@/schema/dashboard/public-data-table/api-verbs/get';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';

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
    const others = fields.filter((field) => !prioritySet.has(field)).sort();

    const sortedPriority = priorityFields.filter((field) => priority.includes(field));

    return [...sortedPriority, ...others];
};
