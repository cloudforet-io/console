<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { PrivateFolderCreateParameters } from '@/schema/dashboard/private-folder/api-verbs/create';
import type { PrivateFolderUpdateParameters } from '@/schema/dashboard/private-folder/api-verbs/update';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicFolderCreateParameters } from '@/schema/dashboard/public-folder/api-verbs/create';
import type { PublicFolderUpdateParameters } from '@/schema/dashboard/public-folder/api-verbs/update';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';


type FolderModel = PublicFolderModel | PrivateFolderModel;
type FolderCreateParams = PublicFolderCreateParameters | PrivateFolderCreateParameters;
type FolderUpdateParams = PublicFolderUpdateParameters | PrivateFolderUpdateParameters;
interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageState = dashboardMainPageStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    isPrivate: false,
    selectedFolder: computed<FolderModel|undefined>(() => {
        if (dashboardMainPageState.folderFormModalType === 'UPDATE') {
            if (dashboardMainPageState.selectedFolderId?.startsWith('private')) {
                return dashboardState.privateFolderItems.find((d) => d.folder_id === dashboardMainPageState.selectedFolderId);
            }
            return dashboardState.publicFolderItems.find((d) => d.folder_id === dashboardMainPageState.selectedFolderId);
        }
        return undefined;
    }),
    existingNameList: computed<string[]>(() => {
        const _publicNames = dashboardState.publicFolderItems.map((d) => d.name);
        const _privateNames = dashboardState.privateFolderItems.map((d) => d.name);
        const _names = [..._publicNames, ..._privateNames];
        if (dashboardMainPageState.folderFormModalType === 'UPDATE') {
            return _names.filter((d) => d !== state.selectedFolder?.name);
        }
        return _names;
    }),
    headerTitle: computed(() => {
        if (dashboardMainPageState.folderFormModalType === 'UPDATE') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.EDIT_FOLDER_NAME');
        return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.CREATE_FOLDER');
    }),
});
const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    initForm,
} = useFormValidator({
    name: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_REQUIRED');
        if (state.existingNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_DUPLICATED');
        return true;
    },
});

/* Api */
const createFolder = async () => {
    try {
        const fetcher = state.isPrivate ? SpaceConnector.clientV2.dashboard.privateFolder.create : SpaceConnector.clientV2.dashboard.publicFolder.create;
        const params: FolderCreateParams = {
            name: name.value as string,
        };
        if (!state.isPrivate) {
            (params as PublicFolderCreateParameters).resource_group = storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE;
        }
        await fetcher(params);
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_CREATE_FOLDER'), '');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_CREATE_FOLDER'));
    }
};
const updateFolderName = async () => {
    try {
        const _isPrivate = dashboardMainPageState.selectedFolderId?.startsWith('private');
        const fetcher = _isPrivate ? SpaceConnector.clientV2.dashboard.privateFolder.update : SpaceConnector.clientV2.dashboard.publicFolder.update;
        const params: FolderUpdateParams = {
            folder_id: state.selectedFolder?.folder_id as string,
            name: name.value as string,
        };
        await fetcher(params);
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_UPDATE_FOLDER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_UPDATE_FOLDER'));
    }
};

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    if (dashboardMainPageState.folderFormModalType === 'UPDATE') {
        await updateFolderName();
    } else {
        await createFolder();
    }
    await dashboardStore.load();
};
const handleUpdatePrivate = (value: boolean) => {
    state.isPrivate = value;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        if (dashboardMainPageState.folderFormModalType === 'UPDATE') {
            setForm('name', state.selectedFolder?.name);
        }
    } else {
        initForm();
        dashboardMainPageStore.reset();
    }
});

</script>

<template>
    <p-button-modal
        :header-title="state.headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="folder-name-input-wrapper"
                           :label="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block w-full"
                                  :placeholder="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME')"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="dashboardMainPageState.folderFormModalType === 'CREATE'"
                           :label="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.MAKE_PRIVATE')"
                           required
            >
                <p-toggle-button :value="state.isPrivate"
                                 @change-toggle="handleUpdatePrivate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.folder-name-input-wrapper {
    margin-bottom: 2rem;
}
</style>
