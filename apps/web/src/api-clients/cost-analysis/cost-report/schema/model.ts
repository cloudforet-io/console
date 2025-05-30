import type { CostReportStatus } from '@/api-clients/cost-analysis/cost-report/schema/type';

import type { Currency } from '@/store/display/type';


export interface CostReportModel {
    cost_report_id: string;
    cost: Record<string, number>;
    status: CostReportStatus;
    report_number: string;
    currency: Currency;
    issue_date: string;
    report_year: string;
    report_month: string;
    name: string;
    cost_report_config_id: string;
    workspace_id: string;
    project_id: string;
    service_account_id: string;
    is_adjusted: boolean;
    domain_id: string;
    bank_name: string;
    currency_date: string;
}

export interface CostReportDataLinkInfoModel {
    cost_report_link: string,
}
