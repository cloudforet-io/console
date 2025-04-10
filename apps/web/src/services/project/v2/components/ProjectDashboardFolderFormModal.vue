<script lang="ts" setup>
import {
    computed, watch,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { FolderCreateParams, FolderUpdateParams } from '@/api-clients/dashboard/_types/folder-type';
import { usePublicFolderApi } from '@/api-clients/dashboard/public-folder/composables/use-public-folder-api';
import type { PublicFolderCreateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/create';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';
import type { ProjectPageContextType } from '@/services/project/v2/types/project-page-context-type';

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.folderFormModalVisible);
const targetFolderId = computed(() => projectPageModalStore.state.targetId);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);
const userStore = useUserStore();
const { publicFolderAPI } = usePublicFolderApi();

/* Query */
const {
    dashboardFolderList,
    setQueryData,
    invalidateAllQueries,
} = useProjectDashboardFolderQuery({
    projectId,
    projectGroupId,
});

const projectContext = computed<ProjectPageContextType>(() => {
    if (projectGroupId.value) return 'PROJECT_GROUP';
    if (projectId.value) return 'PROJECT';
    return undefined;
});

const existingNameList = computed<string[]>(() => dashboardFolderList.value.map((d) => d.name));
const headerTitle = computed(() => {
    if (targetFolderId.value) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.EDIT_FOLDER_NAME');
    return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.CREATE_FOLDER');
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
        if (existingNameList.value.find((d) => d === value)) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_DUPLICATED');
        return true;
    },
});

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    if (targetFolderId.value) {
        const params: FolderUpdateParams = {
            folder_id: targetFolderId.value,
            name: name.value as string,
        };
        updateFolder(params);
    } else {
        const params: FolderCreateParams = {
            name: name.value as string,
            tags: { created_by: userStore.state.userId },
            resource_group: projectContext.value === 'PROJECT_GROUP' ? RESOURCE_GROUP.WORKSPACE : RESOURCE_GROUP.PROJECT,
        };
        if (projectContext.value === 'PROJECT_GROUP') {
            params.project_group_id = projectGroupId.value;
        } else {
            params.project_id = projectId.value;
        }
        createFolder(params);
    }
};

const { mutate: createFolder } = useMutation(
    {
        mutationFn: (params: PublicFolderCreateParameters) => publicFolderAPI.create(params as PublicFolderCreateParameters),
        onSuccess: (folder: PublicFolderModel) => {
            showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_CREATE_FOLDER'), '');
            projectPageModalStore.closeFolderFormModal();
            setQueryData([folder]);
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_CREATE_FOLDER'));
        },
    },
);

const { mutate: updateFolder } = useMutation(
    {
        mutationFn: (params: PublicFolderUpdateParameters) => publicFolderAPI.update(params as PublicFolderUpdateParameters),
        onSuccess: () => {
            showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_UPDATE_FOLDER'), '');
            projectPageModalStore.closeFolderFormModal();
            invalidateAllQueries();
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_UPDATE_FOLDER'));
        },
    },
);

/* Watcher */
watch(visible, (_visible) => {
    if (!_visible) return;
    if (!targetFolderId.value) {
        initForm();

        return;
    }
    const folder = dashboardFolderList.value.find((d) => d.folder_id === targetFolderId.value);
    if (folder) {
        setForm('name', folder.name);
    }
});

</script>

<template>
    <p-button-modal
        :header-title="headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="visible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
        @closed="projectPageModalStore.resetTarget"
        @cancel="projectPageModalStore.closeFolderFormModal"
        @close="projectPageModalStore.closeFolderFormModal"
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
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.folder-name-input-wrapper {
    margin-bottom: 2rem;
}
</style>
