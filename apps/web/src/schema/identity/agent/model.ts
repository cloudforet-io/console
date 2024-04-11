import type { Tags } from '@/schema/_common/model';
import type { AppStatusType } from '@/schema/identity/app/type';

export interface AgentModel {
    agent_id: string;
    options: Record<string, any>;
    client_secret?: string;
    name: string;
    state: AppStatusType;
    is_managed: boolean;
    tags: Tags;
    client_id: string;
    role_id: string;
    app_id: string;
    service_account_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    expired_at: string;
    last_accessed_at: string;
}

/* OpenCost Options
* - cluster_name
* - kube-state-metric
* - prometheus-node-exporter
* */
