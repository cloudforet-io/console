export type TaskFieldType = 'TEXT'|'PARAGRAPH'|'DATE'|'LABELS'|'DROPDOWN'|'USER'|'ASSET';
export type TaskFieldSelectionType = 'SINGLE'|'MULTI';
export interface TaskField {
    field_id: string;
    name: string;
    description?: string;
    field_type: TaskFieldType;
    selection_type?: TaskFieldSelectionType;
    is_required?: boolean;
    is_primary?: boolean; // whether to display field during task creation
    options?: string[]; // for dropdown field type
}
