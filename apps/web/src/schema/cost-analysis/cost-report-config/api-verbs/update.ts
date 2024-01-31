import type { Currency } from '@/store/modules/settings/type';
import type { LanguageCode } from '@/store/modules/user/type';


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
}
