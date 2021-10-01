import { ALERT_STATE } from '@/services/monitoring/alert-manager/lib/config';

export interface AlertCount {
    state: ALERT_STATE;
    count: number;
}

export interface ProjectDetailState {
    projectId: string;

    alertCounts: AlertCount[];
}
