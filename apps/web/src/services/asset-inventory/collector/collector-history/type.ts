export const JOB_SELECTED_STATUS = {
    SUCCESS: 'SUCCESS',
    PROGRESS: 'IN_PROGRESS',
    FAILURE: 'FAILURE',
    CANCELED: 'CANCELED',
    PENDING: 'PENDING',
    ALL: 'ALL',
} as const;

export const JOB_TASK_STATE = {
    IN_PROGRESS: 'IN_PROGRESS',
    FAILURE: 'FAILURE',
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
} as const;

interface PluginInfo {
    label: string;
    icon: string;
}

export interface JobItemType {
    label: string;
    plugin_info: PluginInfo;
}
