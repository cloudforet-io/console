<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PButtonModal, PDefinitionTable, PStatus,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/utils';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { appStateFormatter } from '@/services/administration/composables/refined-table-data';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/administration/constants/app-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { SingleSelectedData } from '@/services/administration/types/modal-type';

interface Props {
    type: string;
    visible: boolean;
    title: string;
    themeColor: string;
    loading: boolean;
    selectedData?: SingleSelectedData;
    isSummary?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    visible: false,
    title: '',
    themeColor: 'primary',
    loading: false,
    selectedData: undefined,
    isSummary: false,
});

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const userPageStore = useUserPageStore();

const emit = defineEmits<{(e: 'confirm', app_key_id: string): void;
    (e: 'close'): void;
}>();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    confirmButton: computed(() => {
        if (props.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            return i18n.t('IAM.APP.DELETE');
        }
        if (props.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            return i18n.t('IAM.APP.ENABLE');
        }
        if (props.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            return i18n.t('IAM.APP.DISABLE');
        }
        if (props.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            return i18n.t('IAM.APP.MODAL.BTN_REGENERATE');
        }
        return '';
    }),
});

const definitionFields = computed(() => (props.isSummary ? [
    { label: i18n.t('IAM.USER.MAIN.API_KEY_ID'), name: 'api_key_id' },
    { label: i18n.t('IAM.APP.MODAL.COL_STATE'), name: 'state' },
    { label: i18n.t('IAM.APP.MODAL.COL_EXPIRED_AT'), name: 'expired_at' },
    { label: i18n.t('IAM.USER.MAIN.CREATED_AT'), name: 'created_at' },
] : [
    { label: i18n.t('IAM.APP.MODAL.COL_NAME'), name: 'name' },
    { label: i18n.t('IAM.APP.MODAL.COL_STATE'), name: 'state' },
    { label: i18n.t('IAM.APP.MODAL.COL_APP_ID'), name: 'app_id' },
    { label: i18n.t('IAM.APP.MODAL.COL_ROLE_ID'), name: 'role_id' },
    { label: i18n.t('IAM.APP.MODAL.COL_LASTED_AT'), name: 'last_accessed_at' },
    { label: i18n.t('IAM.APP.MODAL.COL_EXPIRED_AT'), name: 'expired_at' },
]));

/* Component */
const handleClose = () => {
    emit('close');
};
const handleConfirm = () => {
    if (props.isSummary) {
        checkApiKeyConfirm();
    } else {
        checkAppConfirm();
    }
};

/* API */
const checkAppConfirm = async () => {
    state.loading = true;
    try {
        if (props.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            await appPageStore.deleteApp({ app_id: props.selectedData.app_id || '' });
        } else if (props.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            await appPageStore.enableApp({ app_id: props.selectedData.app_id || '' });
        } else if (props.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            await appPageStore.disableApp({ app_id: props.selectedData.app_id || '' });
        } else if (props.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            const res = await appPageStore.regenerateApp({ app_id: props.selectedData.app_id || '' });
            emit('confirm', res.api_key_id);
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const checkApiKeyConfirm = async () => {
    state.loading = false;
    try {
        if (props.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            await userPageStore.deleteApiKey({ api_key_id: props.selectedData.api_key_id || '' });
        } else if (props.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            await userPageStore.enableApiKey({ api_key_id: props.selectedData.api_key_id || '' });
        } else if (props.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            await userPageStore.disableApiKey({ api_key_id: props.selectedData.api_key_id || '' });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.loading = false;
        handleClose();
    }
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    :header-title="props.title"
                    :theme-color="props.themeColor"
                    :loading="props.loading"
                    modal-size="md"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    >
        <template #body>
            <p-definition-table :fields="definitionFields"
                                :data="props.selectedData"
                                :skeleton-rows="6"
                                block
                                disable-copy
            >
                <template #data-state="{data}">
                    <p-status v-bind="appStateFormatter(data)"
                              class="capitalize"
                    />
                </template>
                <template #data-expired_at="{data}">
                    {{ iso8601Formatter(data, storeState.timezone) }}
                </template>
                <template #data-created_at="{data}">
                    {{ iso8601Formatter(data, storeState.timezone) }}
                </template>
            </p-definition-table>
        </template>
        <template #confirm-button>
            {{ state.confirmButton }}
        </template>
    </p-button-modal>
</template>
