import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import type { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';

export interface DateRange {
    start?: string;
    end: string;
}

export type WidgetLoadData = ListResponse<{
    [key: string]: string|number;
}>;

export type DateFieldType = typeof DATE_FIELD[keyof typeof DATE_FIELD];

export type TableDataItem = Record<string, any>;

export type WidgetDataTableModel = PublicDataTableModel | PrivateDataTableModel;
