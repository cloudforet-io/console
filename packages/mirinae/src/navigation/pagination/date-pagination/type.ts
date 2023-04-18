import type { Dayjs } from 'dayjs';

export interface DatePaginationProps {
    date: Dayjs;
    type: string;
    allowFuture: boolean;
    timezone: string;
}
