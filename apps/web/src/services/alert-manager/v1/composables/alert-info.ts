import { reactive } from 'vue';

import { cloneDeep } from 'lodash';

import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { EDIT_MODE } from '@/services/alert-manager/v1/constants/alert-constant';
import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';

interface AlertDetailItemState {
	isEditMode: boolean;
	alertId: string;
	projectChannelId?: string;
	dataForUpdate?: any;
}

type EditMode = typeof EDIT_MODE[keyof typeof EDIT_MODE];

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

    const getMessage = (editMode: EditMode, isSuccessful: boolean) => {
        if (isSuccessful) {
            return editMode === EDIT_MODE.DESCRIPTION ? i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_DESCRIPTION') : i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_PROJECT');
        }
        return editMode === EDIT_MODE.PROJECT ? i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_DESCRIPTION') : i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_PROJECT');
    };

    const getParams = (editMode: EditMode) => {
        const param: Omit<AlertUpdateParameters, 'alert_id'> = {};

        if (editMode === EDIT_MODE.DESCRIPTION) {
            param.description = state.dataForUpdate;
        } else if (editMode === EDIT_MODE.PROJECT) param.project_id = state.dataForUpdate;
        return param;
    };
    const updateAlert = async (editMode: EditMode) => {
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

    const onClickSave = async (editMode: EditMode) => {
        await updateAlert(editMode);
    };

    return {
        state,
        cancelEdit,
        startEdit,
        onClickSave,
    };
};
