/* eslint-disable camelcase */

export enum ACTION {
    create = 'create',
    delete = 'delete',
    update = 'update',
    default = 'default',
}

export enum SCOPE {
    global = 'GLOBAL',
    project = 'PROJECT',
}

export enum FINISH_CONDITION {
    acknowledged = 'ACKNOWLEDGED',
    resolved = 'RESOLVED',
}

export interface Rule {
    notification_level: string;
    escalate_minutes?: number;
}

export interface EscalationPolicyFormModel {
    name: string;
    rules: Rule[];
    scope: SCOPE.global | SCOPE.project;
    finish_condition: FINISH_CONDITION.acknowledged | FINISH_CONDITION.resolved;
    repeat_count: number;
    project_id?: string;
}
