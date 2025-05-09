<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PRadio, PRadioGroup } from '@cloudforet/mirinae';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { ProjectTreeNodeData } from '@/common/modules/project/project-tree-type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.moveModalVisible && !!projectPageModalStore.state.targetId);
const isProject = computed(() => projectPageModalStore.state.targetType === 'project');
const targetId = computed(() => projectPageModalStore.state.targetId);

const projectListStore = useProjectListStore();
const state = reactive({
    originParentGroupId: computed<string|undefined>(() => {
        if (!targetId.value) return undefined;
        if (isProject.value) return projectListStore.projectMap[targetId.value]?.data.groupInfo?.id;
        return projectListStore.projectGroupMap[targetId.value]?.data.parentGroupInfo?.id;
    }),
    selectedProjectGroupIdList: [] as string[],
    selectProjectGroup: true as boolean,
    isValid: computed<boolean>(() => getIsValid(isProject.value, state.selectProjectGroup, state.selectedProjectGroupIdList, state.originParentGroupId)),
    targetName: computed<string>(() => {
        if (!targetId.value) return '';
        if (isProject.value) return projectListStore.projectMap[targetId.value]?.name;
        return projectListStore.projectGroupMap[targetId.value]?.name;
    }),
    projectGroupSelectOptions: computed(() => ({
        id: targetId.value,
        type: isProject.value ? 'PROJECT' : 'PROJECT_GROUP',
        currentProjectGroupId: state.originParentGroupId,
    })),
});

/* Util */
const getIsValid = (_isProject: boolean, selectProjectGroup: boolean, selectedProjectGroupIdList: string[], originParentGroupId?: string) => {
    if (_isProject) return true;
    if (!selectProjectGroup) { // no project group
        if (!originParentGroupId) return false;
    } else {
        if (!selectedProjectGroupIdList.length) return false;
        if (originParentGroupId === selectedProjectGroupIdList[0]) return false;
    }
    return true;
};

/* mutations */
const { projectAPI } = useProjectApi();
const { key: projectListQueryKey } = useServiceQueryKey('identity', 'project', 'list');
const { withSuffix: projectQueryKeyWithSuffix } = useServiceQueryKey('identity', 'project', 'get');
const { projectGroupAPI } = useProjectGroupApi();
const { key: projectGroupListQueryKey } = useServiceQueryKey('identity', 'project-group', 'list');
const { withSuffix: projectGroupQueryKeyWithSuffix } = useServiceQueryKey('identity', 'project-group', 'get');
const queryClient = useQueryClient();

const { mutateAsync: changeProjectGroup } = useMutation({
    mutationFn: async () => {
        if (!targetId.value) throw new Error('No target id');
        const _projectGroupId = state.selectProjectGroup ? state.selectedProjectGroupIdList[0] : null;
        if (isProject.value) {
            return projectAPI.changeProjectGroup({
                project_id: targetId.value,
                project_group_id: _projectGroupId,
            });
        }
        return projectGroupAPI.changeParentGroup({
            project_group_id: targetId.value,
            parent_group_id: _projectGroupId,
        });
    },
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
        if (isProject.value) {
            const _project = data as ProjectModel;
            queryClient.invalidateQueries({ queryKey: projectListQueryKey.value });
            queryClient.invalidateQueries({ queryKey: projectQueryKeyWithSuffix(_project.project_id) });
        } else {
            const _projectGroup = data as ProjectGroupModel;
            queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
            queryClient.invalidateQueries({ queryKey: projectGroupQueryKeyWithSuffix(_projectGroup.project_group_id) });
        }
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    },
});

/* Event */
const handleChangeSelectProjectGroup = (value: boolean) => {
    state.selectProjectGroup = value;
};
const handleSelectProjectGroup = (projectGroupTreeNodeData: ProjectTreeNodeData[]) => {
    state.selectedProjectGroupIdList = projectGroupTreeNodeData.map((item) => item.id);
};
const handleConfirm = async () => {
    await changeProjectGroup();
    projectPageModalStore.closeMoveModal();
};

/* Watch */
watch([visible, () => state.originParentGroupId], ([v, _id]) => {
    if (!v) return;
    if (_id) {
        state.selectedProjectGroupIdList = [_id];
        state.selectProjectGroup = true;
    } else {
        state.selectedProjectGroupIdList = [];
        state.selectProjectGroup = false;
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal :header-title="$t('PROJECT.LANDING.MODAL_MOVE_PROJECT_GROUP.MODAL_MOVE_PROJECT_TITLE', { name: state.targetName })"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :disabled="!state.isValid"
                    :visible="visible"
                    @close="projectPageModalStore.closeMoveModal()"
                    @cancel="projectPageModalStore.closeMoveModal()"
                    @closed="projectPageModalStore.resetTarget()"
                    @confirm="handleConfirm"
    >
        <template #confirm-button>
            {{ $t('PROJECT.LANDING.MOVE') }}
        </template>
        <template #body>
            <p-radio-group direction="vertical">
                <p-radio :value="true"
                         :selected="state.selectProjectGroup"
                         @change="handleChangeSelectProjectGroup"
                >
                    {{ $t('PROJECT.LANDING.MODAL_MOVE_PROJECT_GROUP.SELECT_A_PROJECT_GROUP_TO_MOVE_TO') }}
                </p-radio>
                <project-select-dropdown v-if="state.projectGroupSelectOptions.id"
                                         :project-selectable="false"
                                         class="project-select-dropdown"
                                         project-group-selectable
                                         :selected-project-ids="state.selectedProjectGroupIdList"
                                         :disabled="!state.selectProjectGroup"
                                         :project-group-select-options="state.projectGroupSelectOptions"
                                         @select="handleSelectProjectGroup"
                />
                <p-radio :value="false"
                         :selected="state.selectProjectGroup"
                         @change="state.selectProjectGroup = $event"
                >
                    {{ isProject ? $t('PROJECT.LANDING.MODAL_MOVE_PROJECT_GROUP.NO_PROJECT_GROUP')
                        : $t('PROJECT.LANDING.MODAL_MOVE_PROJECT_GROUP.NO_PARENT_GROUP') }}
                </p-radio>
            </p-radio-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-select-dropdown {
    padding-left: 1.25rem;
}
</style>
