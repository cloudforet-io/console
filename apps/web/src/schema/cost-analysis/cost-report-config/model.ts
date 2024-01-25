import type { CostReportConfigStatus } from '@/schema/cost-analysis/cost-report-config/type';
import type { RoleType } from '@/schema/identity/role/type';

import type { Currency } from '@/store/modules/settings/type';


export interface CostReportConfigModel {
    cost_report_config_id: string;
    state: CostReportConfigStatus;
    issue_day: number;
    is_last_day: boolean;
    currency: Currency;
    recipients: {
        role_types: RoleType[];
        emails: string[];
    };
    data_source_filter: {
        state: Extract<CostReportConfigStatus, 'ENABLED' | 'DISABLED'>;
        data_sources: string[];
    }
    domain_id: string;
    created_at: string;
    updated_at: string;
}
