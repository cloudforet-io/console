import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { AlertDataModel } from '@/services/alert-manager/type';
import { UpdateAlertParams } from '@/services/alert-manager/store/alert/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const getAlertData = async ({ commit }, alertId: string): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.get({
            alert_id: alertId,
        });
        commit('setAlertData', alert);
    } catch (e) {
        ErrorHandler.handleError(e);
        throw new Error(e);
    }
};

export const updateAlertData = async ({ commit }, params: UpdateAlertParams): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.update({
            ...params.updateParams,
            alert_id: params.alertId,
        });
        commit('setAlertData', alert);
    } catch (e) {
        ErrorHandler.handleError(e);
        throw new Error(e);
    }
};
