import type { ListResponse } from '@/schema/_common/api-verbs/list';

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
