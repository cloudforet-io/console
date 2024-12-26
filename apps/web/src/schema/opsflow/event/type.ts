export type EventType = 'CREATED'|'UPDATED'|'CHANGE_STATUS'|'COMMENTED';
export interface UpdatedDatum {
    updated_field: string;
    updated_content: string;
}
export interface EventAdditionalInfo {
    created_by?: string;
    created_at?: string;
    description?: string;
    updated_by?: string;
    updated_at?: string;
    updated_data?: UpdatedDatum[];
    changed_by?: string;
    before_status?: string;
    after_status?: string;
}
