export interface Actions {
    change_assignee: string;
    change_urgency?: string;
    change_project: string;
    add_project_dependency: string[];
    add_responder: Responder[];
    add_additional_info: Record<string, string>;
    no_notification: boolean;
}

type Responder = {
    resource_type: string;
    resource_id: string;
};

export interface Options {
    stop_processing: boolean;
}

export interface Condition {
    key: string;
    value: string;
    operator: Operator;
}
export type Operator = typeof OPERATOR[keyof typeof OPERATOR];

export const OPERATOR = Object.freeze({
    eq: 'eq',
    contain: 'contain',
    not: 'not',
    not_contain: 'not_contain',
});
