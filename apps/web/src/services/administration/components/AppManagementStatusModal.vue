<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PButtonModal, PDefinitionTable, PStatus,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { appStateFormatter } from '@/services/administration/composables/refined-table-data';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/administration/constants/app-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';

const DEFAULT_PAGE_LIMIT = 15;

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const route = useRoute();

const emit = defineEmits<{(e: 'confirm', app_key_id: string): void;
}>();

const appListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
const appListApiQuery = appListApiQueryHelper.data;

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    confirmButton: computed(() => {
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            return i18n.t('IAM.APP.DELETE');
        }
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            return i18n.t('IAM.APP.ENABLE');
        }
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            return i18n.t('IAM.APP.DISABLE');
        }
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            return i18n.t('IAM.APP.MODAL.BTN_REGENERATE');
        }
        return '';
    }),
});

const definitionFields = computed(() => [
    { label: i18n.t('IAM.APP.MODAL.COL_NAME'), name: 'name' },
    { label: i18n.t('IAM.APP.MODAL.COL_STATE'), name: 'state' },
    { label: i18n.t('IAM.APP.MODAL.COL_APP_ID'), name: 'app_id' },
    { label: i18n.t('IAM.APP.MODAL.COL_ROLE_ID'), name: 'role_id' },
    { label: i18n.t('IAM.APP.MODAL.COL_LASTED_AT'), name: 'last_accessed_at' },
    { label: i18n.t('IAM.APP.MODAL.COL_EXPIRED_AT'), name: 'expired_at' },
]);

/* Component */
const handleClose = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = '';
        _state.modal.visible.status = false;
        _state.modal = cloneDeep(_state.modal);
    });
    getListApps();
};

/* API */
const checkModalConfirm = async () => {
    state.loading = true;

    try {
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            await appPageStore.deleteApp({ app_id: appPageStore.selectedApp.app_id });
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            await appPageStore.enableApp({ app_id: appPageStore.selectedApp.app_id });
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            await appPageStore.disableApp({ app_id: appPageStore.selectedApp.app_id });
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            const res = await appPageStore.regenerateApp({ app_id: appPageStore.selectedApp.app_id });
            emit('confirm', res.api_key_id);
            appPageStore.$patch((_state) => {
                _state.modal.visible.apiKey = true;
                _state.modal = cloneDeep(_state.modal);
            });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const getListApps = async () => {
    state.loading = true;
    try {
        await appPageStore.listApps({ query: appListApiQuery });
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-button-modal :visible="appPageState.modal.visible.status"
                    :header-title="appPageState.modal.title"
                    :theme-color="appPageState.modal.themeColor"
                    :loading="appPageState.modal.loading"
                    modal-size="md"
                    @confirm="checkModalConfirm"
                    @cancel="handleClose"
    >
        <template #body>
            <p-definition-table :fields="definitionFields"
                                :data="appPageStore.selectedApp"
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
