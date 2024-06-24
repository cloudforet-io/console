import type { ListResponse } from '@/schema/_common/api-verbs/list';

import type { _DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';

export interface DateRange {
    start?: string;
    end: string;
}

export type WidgetLoadData = ListResponse<{
    [key: string]: string|number;
}>;

export type DateFieldType = typeof _DATE_FIELD[keyof typeof _DATE_FIELD];
