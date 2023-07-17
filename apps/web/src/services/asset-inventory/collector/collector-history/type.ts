export const JOB_SELECTED_STATUS = {
    SUCCESS: 'SUCCESS',
    PROGRESS: 'IN_PROGRESS',
    FAILURE: 'FAILURE',
    CANCELED: 'CANCELED',
    ALL: 'ALL',
} as const;

export enum JOB_TASK_STATUS {
    success = 'SUCCESS',
    //
    pending = 'PENDING',
    progress = 'IN_PROGRESS',
    //
    failure = 'FAILURE',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
}
