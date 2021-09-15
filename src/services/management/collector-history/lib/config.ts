export enum JOB_STATUS {
    success = 'SUCCESS',
    //
    created = 'CREATED',
    progress = 'IN_PROGRESS',
    //
    error = 'ERROR',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
}

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
