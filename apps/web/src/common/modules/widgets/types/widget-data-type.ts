import type { ListResponse } from '@/schema/_common/api-verbs/list';

export interface DateRange {
    start?: string;
    end: string;
}

export type WidgetLoadData = ListResponse<{
    [key: string]: string|number;
}>;
