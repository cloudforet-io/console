<script setup lang="ts">
import {
    computed, ref, watch,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PButtonModal,
} from '@cloudforet/mirinae';


import type { Tags } from '@/api-clients/_common/schema/model';
import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { Tag } from '@/common/modules/tags/type';

import ProjectTagsInputGroup from '@/services/project/v-shared/components/ProjectTagsInputGroup.vue';
import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.manageTagsModalVisible && !!projectPageModalStore.state.targetId);
const isProject = computed(() => projectPageModalStore.state.targetType === 'project');
const targetId = computed(() => projectPageModalStore.state.targetId);

/* project */
const { data: project, isLoading: projectLoading, setQueryData: setProjectQueryData } = useProjectQuery({
    projectId: targetId,
    enabled: computed(() => visible.value && isProject.value),
});

/* project group */
const { data: projectGroup, isLoading: projectGroupLoading, setQueryData: setProjectGroupQueryData } = useProjectGroupQuery({
    projectGroupId: targetId,
    enabled: computed(() => visible.value && !isProject.value),
});

/* merged states */
const isLoading = computed(() => {
    if (isProject.value) return projectLoading.value;
    return projectGroupLoading.value;
});
const tags = computed(() => {
    if (isProject.value) {
        return project.value?.tags ?? {};
    }
    return projectGroup.value?.tags ?? {};
});
const contextKey = computed(() => Object.entries(tags.value).join(', '));


/* Form */
const newTags = ref<Tags>({});
const isTagsValid = ref(false);
watch([visible, tags], ([v, t]) => {
    if (!v) return;
    newTags.value = cloneDeep(t);
});

/* Mutation */
const { projectAPI } = useProjectApi();
const { projectGroupAPI } = useProjectGroupApi();
const { mutate: updateTags, isPending: isUpdating } = useMutation({
    mutationFn: (_newTags: Tag): Promise<ProjectGroupModel|ProjectModel> => {
        if (!projectPageModalStore.state.targetId) throw new Error('Project ID is not defined');
        if (isProject.value) {
            return projectAPI.update({
                project_id: projectPageModalStore.state.targetId,
                tags: _newTags,
            });
        }
        return projectGroupAPI.update({
            project_group_id: projectPageModalStore.state.targetId,
            tags: _newTags,
        });
    },
    onSuccess: (data) => {
        if (isProject.value) setProjectQueryData(data);
        else setProjectGroupQueryData(data as ProjectGroupModel);
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    },
    onSettled: () => {
        projectPageModalStore.closeManageTagsModal();
    },
});

/* Event Handler */
const handleUpdateTags = (_tags: Tags) => {
    newTags.value = _tags;
};
const handleSaveTags = () => {
    if (!isTagsValid.value) return;
    updateTags(newTags.value);
};
</script>

<template>
    <p-button-modal
        class="project-tags-modal"
        modal-body-id="project-tags"
        :header-title="$t('PROJECT.LANDING.EDIT_TAG')"
        :fade="true"
        :backdrop="true"
        size="sm"
        :visible="visible"
        :disabled="!isTagsValid"
        :loading="isUpdating"
        @close="projectPageModalStore.closeManageTagsModal()"
        @cancel="projectPageModalStore.closeManageTagsModal()"
        @closed="projectPageModalStore.resetTarget()"
        @confirm="handleSaveTags"
    >
        <template #confirm-button>
            {{ $t('PROJECT.LANDING.SAVE_CHANGES') }}
        </template>
        <template #body>
            <p class="text-paragraph-md text-gray-900 whitespace-pre-wrap">
                {{ $t('PROJECT.DETAIL.UPDATE_TAG_DESC') }}
            </p>
            <project-tags-input-group :key="`${targetId}-${contextKey}`"
                                      :tags="newTags"
                                      :disabled="isLoading"
                                      show-validation
                                      :is-valid.sync="isTagsValid"
                                      @update-tags="handleUpdateTags"
            />
        </template>
    </p-button-modal>
</template>
