import type { ProjectAlertConfigOptions } from '@/schema/monitoring/project-alert-config/type';

export interface ProjectAlertConfigCreateParameters {
    project_id: string;
    escalation_policy_id?: string;
    options?: ProjectAlertConfigOptions;
}
