<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButtonModal, PDefinitionTable, PI, PStatus,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, peacock } from '@/styles/colors';

import { appStateFormatter } from '@/services/iam/composables/refined-table-data';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userStore = useUserStore();

const emit = defineEmits<{(e: 'confirm', app?: AppModel): void;
}>();

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceGetters.projectGroup),
});
const state = reactive({
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
    selectedApp: computed(() => {
        let projectLabel = '';
        if (appPageStore.selectedApp.project_group_id) {
            projectLabel = storeState.projectGroups[appPageStore.selectedApp.project_group_id].label;
        } else if (appPageStore.selectedApp.project_id) {
            projectLabel = storeState.projects[appPageStore.selectedApp.project_id].label;
        }
        return {
            ...appPageStore.selectedApp,
            project: appPageStore.selectedApp.project_group_id || appPageStore.selectedApp.project_id ? {
                icon: appPageStore.selectedApp.project_group_id ? 'ic_folder-filled' : 'ic_document-filled',
                color: appPageStore.selectedApp.project_id ? peacock[600] : indigo[500],
                label: projectLabel,
            } : undefined,
        };
    }),
});

const definitionFields = computed(() => {
    const projectFields: DefinitionField[] = [];
    if (appPageStore.selectedApp.project_group_id || appPageStore.selectedApp.project_id) {
        projectFields.push({ label: i18n.t('IAM.APP.MODAL.COL_PROJECT'), name: 'project' });
    }
    return [
        { label: i18n.t('IAM.APP.MODAL.COL_NAME'), name: 'name' },
        { label: i18n.t('IAM.APP.MODAL.COL_STATE'), name: 'state' },
        { label: i18n.t('IAM.APP.MODAL.COL_APP_ID'), name: 'app_id' },
        ...projectFields,
        { label: i18n.t('IAM.APP.MODAL.COL_ROLE_ID'), name: 'role_id' },
        { label: i18n.t('IAM.APP.MODAL.COL_LASTED_AT'), name: 'last_accessed_at' },
        { label: i18n.t('IAM.APP.MODAL.COL_EXPIRED_AT'), name: 'expired_at' },
    ];
});

/* Component */
const handleClose = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = '';
        _state.modal.visible.status = false;
        _state.modal = cloneDeep(_state.modal);
    });
    emit('confirm');
};

/* API */
const checkModalConfirm = async () => {
    try {
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            await appPageStore.deleteApp({ app_id: appPageStore.selectedApp.app_id });
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.ENABLE) {
            await appPageStore.enableApp({ app_id: appPageStore.selectedApp.app_id });
            showSuccessMessage(i18n.t('IAM.APP.ALT_S_ENABLED_APP'), '');
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DISABLE) {
            await appPageStore.disableApp({ app_id: appPageStore.selectedApp.app_id });
            showSuccessMessage(i18n.t('IAM.APP.ALT_S_DISABLED_APP'), '');
        } else if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.REGENERATE) {
            const res = await appPageStore.regenerateApp({ app_id: appPageStore.selectedApp.app_id });
            emit('confirm', res);
            appPageStore.$patch((_state) => {
                _state.modal.visible.apiKey = true;
                _state.modal = cloneDeep(_state.modal);
            });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        handleClose();
    }
};
</script>

<template>
    <p-button-modal :visible="appPageState.modal.visible.status"
                    :header-title="appPageState.modal.title"
                    :theme-color="appPageState.modal.themeColor"
                    :loading="appPageState.modal.loading"
                    size="md"
                    class="app-management-status-modal"
                    @confirm="checkModalConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-definition-table :fields="definitionFields"
                                :data="state.selectedApp"
                                :skeleton-rows="6"
                                block
                                disable-copy
            >
                <template #data-state="{data}">
                    <p-status v-bind="appStateFormatter(data)"
                              class="capitalize"
                    />
                </template>
                <template #data-project="{value}">
                    <div v-if="value"
                         class="col-project"
                    >
                        <p-i :name="value.icon"
                             :color="value.color"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ value.label }}</span>
                    </div>
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


<style lang="postcss" scoped>
.app-management-status-modal {
    .col-project {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
