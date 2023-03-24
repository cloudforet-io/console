import { getCurrentInstance, reactive } from 'vue';
import type { Vue } from 'vue/types/vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ParamType } from '@/services/notification/modules/notification-channel-item/type';
import {
    PARAM_KEY_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';

interface NotificationItemState {
	isEditMode: boolean;
	dataForEdit?: any;
	userChannelId?: string;
	projectChannelId?: string;
}
export const useNotificationItem = (obj: NotificationItemState) => {
    const vm = getCurrentInstance()?.proxy as Vue;
    const state = reactive<NotificationItemState>(obj);
    const cancelEdit = (initialData) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        vm.$emit('edit', undefined);
    };

    const startEdit = (value, initialData) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        vm.$emit('edit', value);
    };

    const updateUserChannel = async (paramKey, paramValue) => {
        try {
            const param: ParamType = {
                user_channel_id: state.userChannelId,
            };
            if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
            else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
            await SpaceConnector.client.notification.userChannel.update(param);
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '');
            state.isEditMode = false;
            vm.$emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_USER_CHANNEL'));
        }
    };

    const updateProjectChannel = async (paramKey, paramValue) => {
        try {
            const param: ParamType = {
                // eslint-disable-next-line camelcase
                project_channel_id: state.projectChannelId,
            };
            if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
            else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
            // eslint-disable-next-line camelcase
            else if (paramKey === PARAM_KEY_TYPE.LEVEL) param.notification_level = paramValue;
            await SpaceConnector.client.notification.projectChannel.update(param);
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '');
            state.isEditMode = false;
            vm.$emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'));
        }
    };

    return {
        state,
        cancelEdit,
        startEdit,
        updateUserChannel,
        updateProjectChannel,
    };
};
