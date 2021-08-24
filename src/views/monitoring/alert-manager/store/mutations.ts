import { Mutation } from 'vuex';
import { AlertStoreState } from '@/views/monitoring/alert-manager/store/type';
import { AlertDataModel } from '@/views/monitoring/alert-manager/type';

export const setAlertData: Mutation<AlertStoreState> = (state, alertData: Partial<AlertDataModel>) => {
    state.alertData = alertData;
};
