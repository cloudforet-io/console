import type { EventType, EventAdditionalInfo } from '@/schema/opsflow/event/type';

export interface EventModel {
    event_id: string;
    event_type: EventType;
    name: string;
    description: string;
    user_type: 'USER'|'APP'; // TODO: replace with UserType
    user_id: string;
    additional_info: EventAdditionalInfo;
    task_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
