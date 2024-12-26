export type CommentType = 'TASK_DESCRIPTION'|'COMMENT';
export interface MentionTargets {
    USER?: string[];
    USER_GROUP?: string[];
}
export interface MentionSource {
    name: string;
    icon?: string;
}
