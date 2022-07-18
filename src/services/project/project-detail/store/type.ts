import type { AlertState } from '@/services/alert-manager/lib/config';

export interface AlertCount {
    state: AlertState;
    count: number;
}

export interface ProjectDetailState {
    projectId: string;

    alertCounts: AlertCount[];
}
