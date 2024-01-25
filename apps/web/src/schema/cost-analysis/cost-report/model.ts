import type { CostReportStatus } from '@/schema/cost-analysis/cost-report/type';

import type { Currency } from '@/store/modules/settings/type';


export interface CostReportConfigModal {
    cost_report_id: string;
    cost: Record<string, number>;
    status: CostReportStatus;
    cost_report_number: string;
    currency: Currency;
    issue_date: string;
    report_year: string;
    report_month: string;
    workspace_name: string;
    cost_report_config_id: string;
    workspace_id: string;
    domain_id: string;
}
