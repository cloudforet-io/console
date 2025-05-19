import type { EventSeverityType, EventType } from '@/schema/alert-manager/event/type';

export interface EventModel {
    event_id: string;
    event_key: string;
    event_type: EventType;
    title: string;
    description: string;
    severity: EventSeverityType;
    rule: string;
    image_url: string;
    resources: string[];
    provider: string;
    account: string;
    additional_info: Record<string, any>;
    raw_data: Record<string, any>;
    alert_id: string;
    webhook_id: string;
    service_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    occurred_at: string;
}
