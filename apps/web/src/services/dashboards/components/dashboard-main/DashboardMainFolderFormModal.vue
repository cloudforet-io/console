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


type FolderModel = PublicFolderModel | PrivateFolderModel;
type FolderCreateParams = PublicFolderCreateParameters | PrivateFolderCreateParameters;
type FolderUpdateParams = PublicFolderUpdateParameters | PrivateFolderUpdateParameters;
interface Props {
    visible: boolean;
    type?: 'EDIT' | 'CREATE';
    folder?: FolderModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'CREATE',
    folder: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isPrivate: false,
    existingNameList: computed<string[]>(() => {
        const _publicNames = dashboardState.publicFolderItems.map((d) => d.name);
        const _privateNames = dashboardState.privateFolderItems.map((d) => d.name);
        const _names = [..._publicNames, ..._privateNames];
        if (props.type === 'EDIT') {
            return _names.filter((d) => d !== props.folder?.name);
        }
        return _names;
    }),
    headerTitle: computed(() => {
        if (props.type === 'EDIT') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.EDIT_FOLDER_NAME');
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
        const _isPrivate = props.folder?.user_id?.length > 0;
        const fetcher = _isPrivate ? SpaceConnector.clientV2.dashboard.privateFolder.update : SpaceConnector.clientV2.dashboard.publicFolder.update;
        const params: FolderUpdateParams = {
            folder_id: props.folder?.folder_id as string,
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
    if (props.type === 'EDIT') {
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
    if (visible && props.type === 'EDIT') {
        setForm('name', props.folder?.name);
    } else {
        initForm();
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
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.MAKE_PRIVATE')"
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
