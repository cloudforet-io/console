import type { Currency } from '@/store/modules/settings/type';


export interface CostReportUpdateParameters {
    cost_report_config_id: string;
    issue_day?: number;
    is_last_day?: boolean;
    currency?: Currency;
    data_source_filter: {
        state: string;
        data_sources: string[];
    };
}
