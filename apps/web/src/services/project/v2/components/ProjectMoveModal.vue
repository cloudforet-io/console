<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PRadio, PRadioGroup } from '@cloudforet/mirinae';


import type { ProjectGroupChangeParentGroupParameters } from '@/api-clients/identity/project-group/schema/api-verbs/change-parent-group';
import type { ProjectChangeProjectGroupParameters } from '@/api-clients/identity/project/schema/api-verbs/change-project-group';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { ProjectTreeNodeData } from '@/common/modules/project/project-tree-type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const emit = defineEmits(['moved']);

const projectPageModalStore = useProjectPageModalStore();
const isProject = computed(() => !!projectPageModalStore.state.targetProjectId);
const targetId = computed(() => projectPageModalStore.state.targetProjectId || projectPageModalStore.state.targetProjectGroupId);

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});
const state = reactive({
    originParentGroupId: computed<string|undefined>(() => {
        if (!targetId.value) return undefined;
        if (isProject.value) return storeState.projects[targetId.value]?.data.groupInfo?.id;
        return storeState.projectGroups[targetId.value]?.data.parentGroupInfo?.id;
    }),
    selectedProjectGroupIdList: [] as string[],
    selectProjectGroup: true as boolean,
    isValid: computed<boolean>(() => getIsValid(isProject.value, state.selectProjectGroup, state.selectedProjectGroupIdList, state.originParentGroupId)),
    targetName: computed<string>(() => {
        if (!targetId.value) return '';
        if (isProject.value) return storeState.projects[targetId.value]?.name;
        return storeState.projectGroups[targetId.value]?.name;
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

/* Api */
const changeProjectGroup = async () => {
    try {
        if (!targetId.value) throw new Error('No target id');
        const _projectGroupId = state.selectProjectGroup ? state.selectedProjectGroupIdList[0] : null;
        if (isProject.value) {
            await SpaceConnector.clientV2.identity.project.changeProjectGroup<ProjectChangeProjectGroupParameters>({
                project_id: targetId.value,
                project_group_id: _projectGroupId,
            });
        } else {
            await SpaceConnector.clientV2.identity.projectGroup.changeParentGroup<ProjectGroupChangeParentGroupParameters>({
                project_group_id: targetId.value,
                parent_group_id: _projectGroupId,
            });
        }
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
        emit('moved');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    }
};

/* Event */
const handleChangeSelectProjectGroup = (value: boolean) => {
    state.selectProjectGroup = value;
};
const handleSelectProjectGroup = (projectGroupTreeNodeData: ProjectTreeNodeData[]) => {
    state.selectedProjectGroupIdList = projectGroupTreeNodeData.map((item) => item.id);
};
const handleConfirm = async () => {
    await changeProjectGroup();
};

/* Watch */
watch(() => state.originParentGroupId, (_id?: string) => {
    if (_id) state.selectedProjectGroupIdList = [_id];
    else state.selectProjectGroup = false;
}, { immediate: true });
</script>

<template>
    <p-button-modal :header-title="$t('PROJECT.LANDING.MODAL_MOVE_PROJECT_GROUP.MODAL_MOVE_PROJECT_TITLE', { name: state.targetName })"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :disabled="!state.isValid"
                    :visible="projectPageModalStore.state.moveModalVisible"
                    @close="projectPageModalStore.closeMoveModal()"
                    @cancel="projectPageModalStore.closeMoveModal()"
                    @confirm="handleConfirm"
    >
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
