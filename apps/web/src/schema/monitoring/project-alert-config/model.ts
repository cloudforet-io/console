import type { ProjectAlertConfigOptions } from '@/schema/monitoring/project-alert-config/type';

export interface ProjectAlertConfigModel {
    project_id: string;
    options: ProjectAlertConfigOptions;
    escalation_policy_info: Record<string, any>;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
