<script setup lang="ts">
import {
    computed, onMounted, ref,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal,
} from '@cloudforet/mirinae';


import type { Tags } from '@/api-clients/_common/schema/model';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { Tag } from '@/common/modules/tags/type';

import ProjectTagsInputGroup from '@/services/project/v-shared/components/ProjectTagsInputGroup.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();

/* project */
const { data: project, isLoading, setQueryData: setProjectQueryData } = useProjectQuery({
    projectId: computed(() => projectPageModalStore.state.targetId),
    enabled: computed(() => projectPageModalStore.state.manageTagsModalVisible),
});
const tags = computed(() => project.value?.tags || {});


/* Form */
const newTags = ref<Tags>({});
const isTagsValid = ref(false);
onMounted(() => {
    newTags.value = { ...tags.value };
});

/* Mutation */
const { projectAPI } = useProjectApi();
const { mutate: updateTags, isPending: isUpdating } = useMutation({
    mutationFn: (_newTags: Tag) => {
        if (!projectPageModalStore.state.targetId) throw new Error('Project ID is not defined');
        return projectAPI.update({
            project_id: projectPageModalStore.state.targetId,
            tags: _newTags,
        });
    },
    onSuccess: (data) => {
        setProjectQueryData(data);
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
        projectPageModalStore.closeManageTagsModal();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
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
        :header-title="$t('PROJECT.DETAIL.UPDATE_TAG')"
        :fade="true"
        :backdrop="true"
        size="sm"
        :visible="projectPageModalStore.state.manageTagsModalVisible"
        :disabled="!isTagsValid"
        :loading="isUpdating"
        @close="projectPageModalStore.closeManageTagsModal()"
        @cancel="projectPageModalStore.closeManageTagsModal()"
        @confirm="handleSaveTags"
    >
        <template #body>
            <p class="text-paragraph-md text-gray-900 whitespace-pre-wrap">
                {{ $t('PROJECT.DETAIL.UPDATE_TAG_DESC') }}
            </p>
            <project-tags-input-group :tags="newTags"
                                      :disabled="isLoading"
                                      show-validation
                                      :is-valid.sync="isTagsValid"
                                      @update-tags="handleUpdateTags"
            />
        </template>
    </p-button-modal>
</template>
