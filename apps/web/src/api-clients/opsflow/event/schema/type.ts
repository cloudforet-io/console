import type { TaskStatusType } from '../../task/schema/type';

export type EventType = 'CREATED'|'UPDATED'|'CHANGE_STATUS'|'COMMENTED';
export interface UpdatedDatum {
    updated_field: string;
    updated_content: string;
}
export interface StatusChange {
    name: string;
    status_type: TaskStatusType;
}
export interface EventAdditionalInfo {
    created_by?: string;
    created_at?: string;
    description?: string;
    updated_by?: string;
    updated_at?: string;
    updated_data?: UpdatedDatum[];
    changed_by?: string;
    changed_at?: string;
    before_status?: StatusChange;
    after_status?: StatusChange;
}
