import type { ProjectAlertConfigOptions } from '@/api-clients/monitoring/project-alert-config/schema/type';

export interface ProjectAlertConfigUpdateParameters {
    project_id: string;
    escalation_policy_id?: string;
    options?: Partial<ProjectAlertConfigOptions>;
}
