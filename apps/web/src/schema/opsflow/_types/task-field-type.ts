export type TaskFieldType = |'GLOBAL'
    |'TEXT'|'PARAGRAPH'|'LABELS'|'DROPDOWN'|'DATE'
    |'USER'|'ASSET'|'PROJECT'|'PROVIDER'|'SERVICE_ACCOUNT';

export type TaskFieldSelectionType = 'SINGLE'|'MULTI';

/* options */
export type TaskFieldEnum = {
    key: string;
    name: string;
};
interface TextTaskFieldOptions {
    example: string;
}
export interface ParagraphTaskFieldOptions {
    example: string;
}
export interface DropdownTaskFieldOptions {
    enums: TaskFieldEnum[];
}
interface OtherTaskFieldOptions {
    [key: string]: never;
}
export type TaskFieldOptions = TextTaskFieldOptions | ParagraphTaskFieldOptions | DropdownTaskFieldOptions | OtherTaskFieldOptions;

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
interface TextTaskField extends BaseTaskField {
    field_type: 'TEXT';
    options: TextTaskFieldOptions;
}
interface ParagraphTaskField extends BaseTaskField {
    field_type: 'PARAGRAPH';
    options: ParagraphTaskFieldOptions;
}
interface DropdownTaskField extends BaseTaskField {
    field_type: 'DROPDOWN';
    options: DropdownTaskFieldOptions;
}
interface OtherTaskField extends BaseTaskField {
    field_type: Exclude<TaskFieldType, 'TEXT'|'PARAGRAPH'|'DROPDOWN'>;
    options: object;
}
export type TaskField = TextTaskField | ParagraphTaskField | DropdownTaskField | OtherTaskField;
