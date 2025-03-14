import type { CostReportConfigStatus } from '@/api-clients/cost-analysis/cost-report-config/schema/type';
import type { RoleType } from '@/api-clients/identity/role/type';

import type { Currency } from '@/store/display/type';
import type { LanguageCode } from '@/store/user/type';


export interface CostReportConfigModel {
    cost_report_config_id: string;
    state: CostReportConfigStatus;
    issue_day: number;
    is_last_day: boolean;
    currency: Currency;
    recipients: {
        role_types: RoleType[];
        emails?: string[];
    };
    data_source_filter: {
        state: Extract<CostReportConfigStatus, 'ENABLED' | 'DISABLED'>;
        data_sources: string[];
    };
    language?: LanguageCode;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
