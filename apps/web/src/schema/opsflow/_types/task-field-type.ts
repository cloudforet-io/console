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
    maxLength?: number;
}

/* task field options by type */
interface TextTaskFieldOptions {
    example?: string;
    maxLength?: number;
}
export interface ParagraphTaskFieldOptions {
    example?: string;
}
export interface DropdownTaskFieldOptions {
    enums: TaskFieldEnum[];
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
export interface OtherTaskField extends BaseTaskField {
    field_type: Exclude<TaskFieldType, 'TEXT'|'PARAGRAPH'|'DROPDOWN'>;
    options: OtherTaskFieldOptions;
}
