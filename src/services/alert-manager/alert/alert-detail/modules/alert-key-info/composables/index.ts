import { reactive } from 'vue';

import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { EditMode } from '@/services/alert-manager/lib/config';
import { EDIT_MODE } from '@/services/alert-manager/lib/config';
import { alertManagerStore } from '@/services/alert-manager/store';

interface AlertDetailItemState {
	isEditMode: boolean;
	alertId: string;
	projectChannelId?: string;
	dataForUpdate?: any;
}

interface ParamType {
	alert_id: string;
	description?: string;
	status_message?: string;
	project_id?: string;
	reset_description?: boolean;
}

export const useAlertInfoItem = (obj: AlertDetailItemState) => {
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
        const param = {} as ParamType;

        if (editMode === EDIT_MODE.DESCRIPTION) {
            const isEmptyInput = state.dataForUpdate.trim().length === 0;
            param.description = state.dataForUpdate;
            param.reset_description = isEmptyInput;
        } else if (editMode === EDIT_MODE.PROJECT) param.project_id = state.dataForUpdate;
        return param;
    };
    const updateAlert = async (editMode: EditMode) => {
        try {
            await alertManagerStore.dispatch('alert/updateAlertData', {
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
        updateAlert,
        onClickSave,
    };
};
