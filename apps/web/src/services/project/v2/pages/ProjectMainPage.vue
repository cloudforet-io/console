<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, toRef,
} from 'vue';

import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { indigo, peacock } from '@/styles/colors';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import ProjectAndGroupListPanel from '@/services/project/v2/components/ProjectAndGroupListPanel.vue';
import ProjectDeleteModal from '@/services/project/v2/components/ProjectDeleteModal.vue';
import ProjectGroupMemberManagementModal from '@/services/project/v2/components/ProjectGroupMemberManagementModal.vue';
import ProjectHeader from '@/services/project/v2/components/ProjectHeader.vue';
import ProjectMemberInviteModal from '@/services/project/v2/components/ProjectMemberInviteModal.vue';
import ProjectMemberManagementModal from '@/services/project/v2/components/ProjectMemberManagementModal.vue';
import ProjectMoveModal from '@/services/project/v2/components/ProjectMoveModal.vue';
import ProjectTagsModal from '@/services/project/v2/components/ProjectTagsModal.vue';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    projectGroupOrProjectId?: string;
}>();

/* project or group */
const { projectGroupId, projectId } = useProjectOrGroupId(toRef(props, 'projectGroupOrProjectId'));
const { data: projectGroup } = useProjectGroupQuery({
    projectGroupId,
});


/* modals */
const projectPageModelStore = useProjectPageModalStore();

const menuRef = ref<any|null>(null);

const state = reactive({
    createMenuVisible: false,
    createDropdownMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'project',
            label: i18n.t('PROJECT.LANDING.PROJECT'),
            icon: 'ic_document-filled',
            iconColor: peacock[600],
        },
        {
            name: 'projectGroup',
            label: i18n.t('PROJECT.LANDING.PROJECT_GROUP'),
            icon: 'ic_folder-filled',
            iconColor: indigo[500],
        },
    ])),
    projectGroupModalVisible: false,
    projectGroupMemberManagementModalVisible: false,
    projectGroupMemberCount: computed<number|undefined>(() => projectGroup.value?.users?.length),
});

onClickOutside(menuRef, () => {
    state.createMenuVisible = false;
});

const handleMoved = () => {
    // projectTreeStore.refreshProjectTree();
};

const handleRefreshTree = () => {
    // projectTreeStore.refreshProjectTree();
};


onUnmounted(() => {
    // projectTreeStore.disposeProjectTree();
});
</script>

<template>
    <div class="page-wrapper">
        <project-header :project-id="projectId"
                        :project-group-id="projectGroupId"
        />
        <project-and-group-list-panel />
        <project-group-member-management-modal />
        <project-member-management-modal />
        <project-delete-modal :skip-redirect="!!projectPageModelStore.state.targetId &&
                                  (projectPageModelStore.state.targetId === projectGroupId || projectPageModelStore.state.targetId === projectId)"
                              @confirm="handleRefreshTree"
        />
        <project-move-modal @moved="handleMoved" />
        <project-member-invite-modal :project-id="projectId" />
        <project-tags-modal />
    </div>
</template>

<style lang="postcss" scoped>
/* right contents */
.page-wrapper {
    @apply flex flex-col w-full h-full;
}

.title-right-button-wrapper {
    display: inline-flex;
    align-items: center;
}
.create-context-menu {
    @apply absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    width: max-content;
}
.create-button-wrapper {
    @apply relative inline-block;
    height: 2rem;
}

.parents-info {
    @apply flex items-center text-gray-900;
    min-height: 1rem;
    margin-bottom: 0.25rem;
    .group-name {
        @apply inline-flex items-center text-xs;
    }
    .text {
        @apply opacity-50;
        &.link {
            @apply cursor-pointer;
            &:hover {
                @apply opacity-100;
            }
        }
    }
}

.card-container {
    @apply flex-grow;
}

/* custom design-system component - p-heading */
:deep(.p-heading) {
    @apply border-none;
    padding-bottom: 0;
}
</style>
