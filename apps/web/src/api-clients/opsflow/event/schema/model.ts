import type { EventType, EventAdditionalInfo } from './type';

export interface EventModel {
    event_id: string;
    event_type: EventType;
    name: string;
    description: string;
    created_type: string;
    created_by: string;
    additional_info: EventAdditionalInfo;
    task_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
