import type { RoleType } from '@/api-clients/identity/role/type';


export interface CostReportConfigUpdateRecipientsParameters {
    cost_report_config_id: string;
    recipients?: {
        role_types: RoleType[];
        emails?: string[];
    };
}
