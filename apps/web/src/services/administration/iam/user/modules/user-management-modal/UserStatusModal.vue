<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PStatus, PTableCheckModal,
} from '@spaceone/design-system';
import { map } from 'lodash';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    headerTitle: string;
    subTitle: string;
    themeColor: string;
    mode: string;
}

const props = withDefaults(defineProps<Props>(), {
    subTitle: '',
    themeColor: 'alert',
    mode: '',
});
const emit = defineEmits(['confirm']);
const { t } = useI18n();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    fields: computed(() => ([
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'user_type', label: 'Access Control' },
        { name: 'api_key_count', label: 'API Key' },
        { name: 'role_name', label: 'Role' },
        { name: 'backend', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
        { name: 'timezone', label: 'Timezone' },
    ])),
});

const getUsersParam = (items) => ({ users: map(items, 'user_id') });

const deleteUser = async (items) => {
    try {
        await SpaceConnector.client.identity.user.delete(getUsersParam(items));
        userPageStore.$patch({ selectedIndices: [] });
        showSuccessMessage(t('IDENTITY.USER.MAIN.ALT_S_DELETE_USER', userPageState.selectedIndices.length), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.MAIN.ALT_E_DELETE_USER', userPageState.selectedIndices.length));
    } finally {
        emit('confirm');
        userPageStore.$patch({ visibleStatusModal: false });
    }
};
const enableUser = async (items) => {
    try {
        await SpaceConnector.client.identity.user.enable(getUsersParam(items));
        showSuccessMessage(t('IDENTITY.USER.MAIN.ALT_S_ENABLE', userPageState.selectedIndices.length), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.MAIN.ALT_E_ENABLE', userPageState.selectedIndices.length));
    } finally {
        emit('confirm');
        userPageStore.$patch({ visibleStatusModal: false });
    }
};
const disableUser = async (items) => {
    try {
        await SpaceConnector.client.identity.user.disable(getUsersParam(items));
        showSuccessMessage(t('IDENTITY.USER.MAIN.ALT_S_DISABLE', userPageState.selectedIndices.length), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IDENTITY.USER.MAIN.ALT_E_DISABLE', userPageState.selectedIndices.length));
    } finally {
        emit('confirm');
        userPageStore.$patch({ visibleStatusModal: false });
    }
};
const checkModalConfirm = async (item) => {
    if (props.mode === 'delete') await deleteUser(item);
    else if (props.mode === 'enable') await enableUser(item);
    else if (props.mode === 'disable') await disableUser(item);
};

const handleClose = () => {
    userPageStore.$patch({ visibleStatusModal: false });
};

</script>

<template>
    <p-table-check-modal
        v-if="!!mode"
        :visible="userPageState.visibleStatusModal"
        :header-title="headerTitle"
        :sub-title="subTitle"
        :theme-color="themeColor"
        :fields="state.fields"
        :items="userPageStore.selectedUsers"
        modal-size="md"
        @confirm="checkModalConfirm"
        @cancel="handleClose"
    >
        <template #col-state-format="{value}">
            <p-status v-bind="userStateFormatter(value)"
                      class="capitalize"
            />
        </template>
        <template #col-last_accessed_at-format="{ value }">
            <span v-if="value === -1">
                No Activity
            </span>
            <span v-if="value === 0">
                {{ t('IDENTITY.USER.MAIN.TODAY') }}
            </span>
            <span v-else-if="value === 1">
                {{ t('IDENTITY.USER.MAIN.YESTERDAY') }}
            </span>
            <span v-else>
                {{ value }} {{ t('IDENTITY.USER.MAIN.DAYS') }}
            </span>
        </template>
    </p-table-check-modal>
</template>
