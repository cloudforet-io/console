import { Mutation } from 'vuex';
import { AlertState } from '@/services/alert-manager/store/alert/type';
import { AlertDataModel } from '@/services/alert-manager/type';

export const setAlertData: Mutation<AlertState> = (state, alertData: Partial<AlertDataModel>) => {
    state.alertData = alertData;
};
