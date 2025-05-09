import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    AlertsInfoType, AlertsType, HealthyType, MembersType, ServiceOptionsType,
} from '@/schema/alert-manager/service/type';

export interface ServiceModel {
    service_id: string;
    name: string;
    service_key: string;
    description: string;
    members: Record<MembersType, string[]>;
    service_healthy: HealthyType;
    options: ServiceOptionsType;
    channels?: string[];
    webhooks?: string[];
    alerts?: Record<AlertsType, AlertsInfoType>;
    tags: Tags;
    escalation_policy_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
