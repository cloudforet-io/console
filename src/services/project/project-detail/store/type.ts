import type { AlertState } from '@/services/alert-manager/lib/config';

export interface AlertCount {
    state: AlertState;
    total: number;
}

export interface MaintenanceHappening {
    title: string;
    startTime: string;
    endTime: string;
}

export interface ProjectDetailState {
    projectId: string;
    alertCounts: AlertCount[];
    maintenanceHappenings: MaintenanceHappening[];
}
