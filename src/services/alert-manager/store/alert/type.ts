import type { AlertDataModel } from '@/services/alert-manager/type';

export interface AlertState {
	alertData: Partial<AlertDataModel>|null;
}

export interface UpdateAlertParams {
	alertId: string;
	updateParams: any;
}
