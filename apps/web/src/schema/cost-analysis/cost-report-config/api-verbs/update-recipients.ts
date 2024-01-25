import type { RoleType } from '@/schema/identity/role/type';


export interface CostReportUpdateRecipientsParameters {
    cost_report_config_id: string;
    recipients?: {
        role_types: RoleType[];
        emails: string[];
    };
}
