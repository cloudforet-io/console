import type { Currency } from '@/store/display/type';
import type { LanguageCode } from '@/store/user/type';


export interface CostReportConfigUpdateParameters {
    cost_report_config_id: string;
    issue_day?: number;
    is_last_day?: boolean;
    currency?: Currency;
    language?: LanguageCode;
    data_source_filter?: {
        state: string;
        data_sources: string[];
    };
    adjustment_options?: {
        enabled: boolean;
        period: number;
    };
}
