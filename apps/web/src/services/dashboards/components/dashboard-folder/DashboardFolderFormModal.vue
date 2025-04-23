<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { FolderCreateParams, FolderModel, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import type { PrivateFolderCreateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/create';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import type { PublicFolderCreateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/create';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';

interface Props {
    visible: boolean;
    folderId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    folderId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();
const userStore = useUserStore();

const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;

/* Query */
const queryClient = useQueryClient();
const {
    publicFolderList,
    privateFolderList,
    keys,
    api,
    fetcher,
} = useDashboardFolderQuery();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
});
const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    isPrivate: false,
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed(() => privateFolderList.value),
    selectedFolder: computed<FolderModel|undefined>(() => {
        if (dashboardPageControlState.folderFormModalType === 'UPDATE') {
            if (props.folderId?.startsWith('private')) {
                return state.privateFolderItems.find((d) => d.folder_id === props.folderId);
            }
            return state.publicFolderItems.find((d) => d.folder_id === props.folderId);
        }
        return undefined;
    }),
    existingNameList: computed<string[]>(() => {
        const _targetFolderItems = state.isPrivate ? state.privateFolderItems : state.publicFolderItems;
        if (dashboardPageControlState.folderFormModalType === 'UPDATE') {
            return _targetFolderItems.filter((d) => d.folder_id !== state.selectedFolder?.folder_id).map((d) => d.name);
        }
        return _targetFolderItems.map((d) => d.name);
    }),
    headerTitle: computed(() => {
        if (dashboardPageControlState.folderFormModalType === 'UPDATE') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.EDIT_FOLDER_NAME');
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

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    if (dashboardPageControlState.folderFormModalType === 'UPDATE') {
        const params: FolderUpdateParams = {
            folder_id: state.selectedFolder?.folder_id as string,
            name: name.value as string,
        };
        updateFolder(params);
    } else {
        const _isPrivate = storeState.isWorkspaceMember ? true : state.isPrivate;
        const params: FolderCreateParams = {
            name: name.value as string,
            tags: { created_by: userStore.state.userId },
        };
        if (!_isPrivate) {
            (params as PublicFolderCreateParameters).resource_group = storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE;
        }
        createFolder(params);
    }
};
const handleUpdatePrivate = (value: boolean) => {
    state.isPrivate = value;
};

const createFolderFn = (params: PrivateFolderCreateParameters | PublicFolderCreateParameters): Promise<FolderModel> => {
    const _isPrivate = storeState.isWorkspaceMember ? true : state.isPrivate;
    if (_isPrivate) {
        return api.privateFolderAPI.create(params as PrivateFolderCreateParameters);
    }
    return api.publicFolderAPI.create(params as PublicFolderCreateParameters);
};
const { mutate: createFolder } = useMutation(
    {
        mutationFn: createFolderFn,
        onSuccess: (folder: PublicFolderModel|PrivateFolderModel) => {
            dashboardTreeControlStore.setNewIdList([
                ...dashboardTreeControlState.newIdList,
                folder.folder_id,
            ]);
            showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_CREATE_FOLDER'), '');
            state.proxyVisible = false;

            const isPrivate = folder.folder_id.startsWith('private');
            const folderListQueryKey = isPrivate ? keys.privateFolderListQueryKey : keys.publicFolderListQueryKey;
            queryClient.invalidateQueries({ queryKey: folderListQueryKey.value });
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_CREATE_FOLDER'));
        },
    },
);
const { mutate: updateFolder } = useMutation(
    {
        mutationFn: fetcher.updateFolderFn,
        onSuccess: (folder: PublicFolderModel|PrivateFolderModel) => {
            showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_UPDATE_FOLDER'), '');
            state.proxyVisible = false;

            const isPrivate = folder.folder_id.startsWith('private');
            const folderListQueryKey = isPrivate ? keys.privateFolderListQueryKey : keys.publicFolderListQueryKey;
            queryClient.invalidateQueries({ queryKey: folderListQueryKey.value });
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_UPDATE_FOLDER'));
        },
    },
);

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        if (dashboardPageControlState.folderFormModalType === 'UPDATE') {
            setForm('name', state.selectedFolder?.name);
        }
    } else {
        initForm();
        dashboardPageControlStore.reset();
        dashboardTreeControlStore.reset();
        state.isPrivate = false;
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
            <p-field-group v-if="dashboardPageControlState.folderFormModalType === 'CREATE' && !storeState.isAdminMode && !storeState.isWorkspaceMember"
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
