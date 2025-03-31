<script setup lang="ts">
import {
    computed, toRef, watch,
} from 'vue';

import { PI, PSkeleton } from '@cloudforet/mirinae';

import type { ProjectType } from '@/api-clients/identity/project/schema/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, peacock } from '@/styles/colors';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import ProjectActionDropdownButton from '@/services/project/v2/components/ProjectActionDropdownButton.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useWorkspaceUsersQuery } from '@/services/project/v2/composables/queries/use-workspace-users-query';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const props = defineProps<{
    projectId?: string;
    projectGroupId?: string;
}>();

const appContextStore = useAppContextStore();
const projectPageModalStore = useProjectPageModalStore();

/* project */
const { data: project, error: projectError, isLoading: loadingProject } = useProjectQuery({
    projectId: toRef(props, 'projectId'),
    enabled: computed(() => !appContextStore.getters.globalGrantLoading),
});
watch(projectError, () => {
    ErrorHandler.handleError(new NoResourceError({ name: PROJECT_ROUTE_V2._NAME }));
});
const projectType = computed<ProjectType|undefined>(() => project.value?.project_type);

/* project group */
const { data: projectGroup, error: projectGroupError, isLoading: loadingProjectGroup } = useProjectGroupQuery({
    projectGroupId: toRef(props, 'projectGroupId'),
    enabled: computed(() => !appContextStore.getters.globalGrantLoading),
});


/* members */
const { data: workspaceUsers } = useWorkspaceUsersQuery();
const memberCount = computed(() => {
    if (project.value && projectType.value === 'PRIVATE') {
        return project.value.users?.length ?? 0;
    }
    // if(projectGroup.value) return projectGroup.value.users?.length ?? 0;
    return workspaceUsers.value?.length ?? 0;
});

/* tags */
const tagsCount = computed(() => {
    if (project.value?.tags) return Object.keys(project.value.tags).length ?? 0;
    if (projectGroup.value?.tags) return Object.keys(projectGroup.value.tags).length ?? 0;
    return 0;
});

/* Event */
// const handleConfirmInvite = () => {
//     fetchUserList();
// };

// const handleConfirmProjectForm = (_, data: ProjectModel) => {
//     setProjectQueryData(data);
// };


// const handleRefreshTree = () => {
//     projectTreeStore.refreshProjectTree();
// };


/* Watchers */
// watch(projectId, (pid) => {
//     gnbStore.setId(pid);
// }, { immediate: true });

/* Event Handlers */
const handleClickMember = () => {
    if (!props.projectId) return;
    projectPageModalStore.openProjectManageMemberModal(props.projectId);
};
const handleClickTags = () => {
    if (!props.projectId) return;
    projectPageModalStore.openProjectManageTagsModal(props.projectId);
};

</script>

<template>
    <div class="project-header">
        <div class="header-container">
            <div class="header-icon-wrapper tablet">
                <p-i name="ic_document-filled"
                     width="1.5rem"
                     height="1.5rem"
                     :color="peacock[600]"
                />
            </div>
            <div class="header-contents">
                <div class="title-wrapper">
                    <p-skeleton v-if="loadingProject || loadingProjectGroup"
                                class="skeleton"
                                width="200px"
                                height="24px"
                    />
                    <span v-else-if="projectError || projectGroupError"
                          class="error"
                    >
                        Failed to load project
                    </span>
                    <span v-else-if="project || projectGroup"
                          class="title"
                    >
                        {{ project ? project.name : projectGroup?.name }}
                    </span>
                    <project-action-dropdown-button v-if="props.projectId || props.projectGroupId"
                                                    :project-id="props.projectId"
                                                    :project-group-id="props.projectGroupId"
                    />
                </div>
                <div class="header-sub-contents">
                    <div class="description">
                        <template v-if="projectType === 'PRIVATE'">
                            <div class="info-item invite-only">
                                <p-i name="ic_lock-filled"
                                     width="0.625rem"
                                     height="0.625rem"
                                     color="inherit"
                                />
                                <span>{{ $t('PROJECT.DETAIL.INVITE_ONLY') }}</span>
                            </div>
                            <p-i name="ic_dot"
                                 width="0.125rem"
                                 height="0.125rem"
                                 :color="gray[400]"
                            />
                            <div class="info-item"
                                 @click="handleClickMember"
                            >
                                <template v-if="projectType === 'PRIVATE' && memberCount === 0">
                                    <p-i class="info-icon"
                                         name="ic_plus"
                                         width="0.75rem"
                                         height="0.75rem"
                                         color="inherit"
                                    />
                                    <span>{{ $t('PROJECT.DETAIL.ADD_MEMBERS') }}</span>
                                </template>
                                <template v-else>
                                    <p-i class="info-icon"
                                         name="ic_member"
                                         width="0.75rem"
                                         height="0.75rem"
                                         color="inherit"
                                    />
                                    <span>{{ memberCount }}{{ $t('PROJECT.DETAIL.MEMBERS') }}</span>
                                </template>
                            </div>
                            <p-i name="ic_dot"
                                 width="0.125rem"
                                 height="0.125rem"
                                 :color="gray[400]"
                            />
                        </template>
                        <p-i name="ic_dot"
                             width="0.125rem"
                             height="0.125rem"
                             :color="gray[400]"
                        />
                        <div class="info-item"
                             @click="handleClickTags"
                        >
                            <p-i class="info-icon"
                                 name="ic_label"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="inherit"
                            />
                            <span>{{ tagsCount }}{{ $t('PROJECT.DETAIL.TAGS') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-header {

    .header-container {
        @apply flex gap-3;
        .header-icon-wrapper {
            @apply flex items-center justify-center border-2 border-white;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 0.75rem;
            background-color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            &.tablet {
                display: flex;
            }
            &.mobile {
                display: none;
            }
        }
        .header-contents {
            .title-wrapper {
                @apply flex items-center gap-2;
                padding-bottom: 0.375rem;
                .title {
                    @apply text-display-md font-bold text-gray-900;
                }
            }
            .header-sub-contents {
                .description {
                    @apply flex items-center gap-2;
                    .info-item {
                        @apply flex items-center text-label-sm text-gray-700 cursor-pointer;
                        gap: 0.15625rem;
                        .info-icon {
                            min-width: 0.75rem;
                        }
                        &.invite-only {
                            @apply text-gray-900 cursor-auto;
                        }
                    }
                }
            }
        }
    }

    .quick-link-wrapper {
        @apply flex items-center gap-4 bg-white border border-gray-200 rounded-lg;
        width: 100%;
        height: 2.75rem;
        padding: 0.75rem 1rem;
        margin-top: 1.5rem;

        .field-title {
            @apply text-label-md font-bold text-gray-600;
        }
    }
}

@screen mobile {
    .project-header {
        .header-container {
            .header-icon-wrapper {
                @apply bg-transparent;
                align-items: flex-start;
                cursor: default;
                border: none;
                padding-top: 0.25rem;
                &.tablet {
                    display: none;
                }
                &.mobile {
                    display: flex;
                }
            }
        }
    }
}
</style>
