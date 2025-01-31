import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import type { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import type { DataInfo, LabelsInfo } from '@/common/modules/widgets/types/widget-model';

export interface DateRange {
    start: string;
    end: string;
}

export type DateFieldType = typeof DATE_FIELD[keyof typeof DATE_FIELD];

export type TableDataItem = Record<string, any>;



export type WidgetLoadResponse = ListResponse<Record<string, string|number>> & {
    labels_info: LabelsInfo;
    data_info: DataInfo;
    order: string[];
};
