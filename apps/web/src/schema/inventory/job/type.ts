export type JobStatus = |
    'IN_PROGRESS' | // One or more JobTasks are running
    'FAILURE' | // When one or more JobTasks are FAILURE or TIMEOUT
    'CANCELED' | // When a Job is Canceled
    'SUCCESS'; // When all JobTasks succeed
