export type ReportAdjustmentPolicyScope = 'WORKSPACE'|'PROJECT';

export type ReportAdjustmentPolicyFilter = {
    workspace_ids?: string[];
    project_ids?: string[];
};
