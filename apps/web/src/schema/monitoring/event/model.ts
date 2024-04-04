import type { AlertSeverity, AlertResource } from '@/schema/monitoring/alert/type';
import type { EventType } from '@/schema/monitoring/event/type';

export interface EventModel {
    event_id: string;
    event_key: string;
    event_type: EventType;
    title: string;
    description: string;
    severity: AlertSeverity;
    rule: string;
    image_url: string;
    resource: AlertResource;
    provider: string;
    account: string;
    additional_info: Record<string, any>;
    raw_data: Record<string, any>;
    alert_id: string;
    webhook_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    occurred_at: string;
}
