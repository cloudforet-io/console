import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UpdateAlertParams } from '@/services/alert-manager/store/alert/type';
import type { AlertDataModel } from '@/services/alert-manager/type';

export const getAlertData = async ({ commit }, alertId: string): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.get({
            alert_id: alertId,
        });
        commit('setAlertData', alert);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const updateAlertData = async ({ commit }, params: UpdateAlertParams): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.update({
            ...params.updateParams,
            alert_id: params.alertId,
        });
        commit('setAlertData', alert);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
