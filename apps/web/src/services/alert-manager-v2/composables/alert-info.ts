import { reactive } from 'vue';

import { cloneDeep } from 'lodash';

import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';

interface AlertDetailItemState {
	isEditMode: boolean;
	alertId: string;
	projectChannelId?: string;
	dataForUpdate?: any;
}

export const useAlertInfoItem = (obj: AlertDetailItemState) => {
    const alertPageStore = useAlertPageStore();
    const state = reactive<AlertDetailItemState>(obj);
    const cancelEdit = (initialData) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForUpdate = cloneDeep(initialData);
        } else {
            state.dataForUpdate = initialData;
        }
    };

    const startEdit = (initialData) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForUpdate = cloneDeep(initialData);
        } else {
            state.dataForUpdate = initialData;
        }
    };

    const getMessage = (editMode) => editMode === i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_DESCRIPTION');

    const getParams = () => {
        const param: Omit<AlertUpdateParameters, 'alert_id'> = {};

        param.description = state.dataForUpdate;
        return param;
    };
    const updateAlert = async (editMode) => {
        try {
            await alertPageStore.updateAlertData({
                updateParams: getParams(editMode),
                alertId: state.alertId,
            });
            showSuccessMessage(getMessage(editMode, true), '');
            state.isEditMode = false;
        } catch (e) {
            ErrorHandler.handleRequestError(e, getMessage(editMode, false));
        }
    };

    const onClickSave = async (editMode) => {
        await updateAlert(editMode);
    };

    return {
        state,
        cancelEdit,
        startEdit,
        onClickSave,
    };
};
