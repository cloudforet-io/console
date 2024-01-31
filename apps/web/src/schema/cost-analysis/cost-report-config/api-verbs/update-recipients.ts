import type { RoleType } from '@/schema/identity/role/type';


export interface CostReportConfigUpdateRecipientsParameters {
    cost_report_config_id: string;
    recipients?: {
        role_types: RoleType[];
        emails: string[];
    };
}
