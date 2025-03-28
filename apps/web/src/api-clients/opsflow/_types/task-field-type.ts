export type TaskFieldType = |'GLOBAL'
    |'TEXT'|'PARAGRAPH'|'LABELS'|'DROPDOWN'|'DATE'
    |'USER'|'ASSET'|'PROJECT'|'PROVIDER'|'SERVICE_ACCOUNT';

export type TaskFieldSelectionType = 'SINGLE'|'MULTI';

/* options */
export type TaskFieldEnum = {
    key: string;
    name: string;
};
export interface TaskFieldOptions { // union of all task field options
    example?: string;
    enums?: TaskFieldEnum[];
    max_length?: number;
    match_pattern?: string;
}

/* task field options by type */
export interface TextTaskFieldOptions {
    description?: string;
    example?: string;
    max_length?: number;
}
export interface ParagraphTaskFieldOptions {
    example?: string;
}
export interface DropdownTaskFieldOptions {
    enums: TaskFieldEnum[];
}
export interface ProjectTaskFieldOptions {
    match_pattern?: string;
}
interface OtherTaskFieldOptions {
    [key: string]: never;
}


/* task field */
interface BaseTaskField {
    field_id: string;
    name: string;
    description?: string;
    field_type: TaskFieldType;
    selection_type?: TaskFieldSelectionType;
    is_required?: boolean;
    is_primary?: boolean; // whether to display field during task creation
}
export interface TaskField extends BaseTaskField { // union of all task fields
    field_type: TaskFieldType;
    options?: TaskFieldOptions;
}

/* task fields by type */
export interface TextTaskField extends BaseTaskField {
    field_type: 'TEXT';
    options?: TextTaskFieldOptions;
}
export interface ParagraphTaskField extends BaseTaskField {
    field_type: 'PARAGRAPH';
    options?: ParagraphTaskFieldOptions;
}
export interface DropdownTaskField extends BaseTaskField {
    field_type: 'DROPDOWN';
    options?: DropdownTaskFieldOptions;
}
export interface ProjectTaskField extends BaseTaskField {
    field_type: 'PROJECT';
    options?: ProjectTaskFieldOptions;
}
export interface OtherTaskField extends BaseTaskField {
    field_type: Exclude<TaskFieldType, 'TEXT'|'PARAGRAPH'|'DROPDOWN'|'PROJECT'>;
    options: OtherTaskFieldOptions;
}
