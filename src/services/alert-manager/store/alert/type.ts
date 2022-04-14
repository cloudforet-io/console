import { AlertDataModel } from '@/services/alert-manager/type';

export interface AlertState {
	alertData: Partial<AlertDataModel>|null;
}

export interface UpdateAlertParams {
	alertId: string;
	updateParams: object;
}
