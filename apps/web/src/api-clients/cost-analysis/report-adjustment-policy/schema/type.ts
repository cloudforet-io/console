export type ReportAdjustmentPolicyScope = 'WORKSPACE'|'PROJECT'|'SERVICE_ACCOUNT';

export type ReportAdjustmentPolicyFilter = {
    workspace_ids?: string[];
    project_ids?: string[];
};
