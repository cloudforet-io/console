import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';
import type { RoleType } from '@/schema/identity/role/type';

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
