import type { CostReportModel } from '@/api-clients/cost-analysis/cost-report/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';

export type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum?: Array<{
        date: string;
        value: number
    }>;
    _total_value_sum?: number;
};

export interface CostReportItem extends CostReportModel {
    recipients?: {
        role_types: RoleType[];
        emails: string[];
    };
    report_url?: string;
}
