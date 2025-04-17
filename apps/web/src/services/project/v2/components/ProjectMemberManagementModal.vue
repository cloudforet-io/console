<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PEmpty, PLazyImg, PIconButton, PButton,
} from '@cloudforet/mirinae';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectType } from '@/api-clients/identity/project/schema/type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useWorkspaceUsersQuery } from '@/services/project/v2/composables/queries/use-workspace-users-query';
import { useUserInfo } from '@/services/project/v2/composables/use-user-info';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectMemberModalVisible);
const targetId = computed(() => projectPageModalStore.state.targetId);

/* project */
const { data: project, setQueryData } = useProjectQuery({
    projectId: targetId,
    enabled: visible,
});
const projectType = computed<ProjectType|undefined>(() => project.value?.project_type);

/* members */
const { data: workspaceUsers, error } = useWorkspaceUsersQuery({
    enabled: computed(() => visible.value && projectType.value === 'PUBLIC'),
});
const possibleUserIds = computed<string[]>(() => {
    if (projectType.value === 'PUBLIC') {
        if (!workspaceUsers.value) return [];
        return workspaceUsers.value?.map((user) => user.user_id) || [];
    }
    return project.value?.users || [];
});
watch(error, (e) => {
    if (e) ErrorHandler.handleError(e);
});


/* users info */
const {
    getUserIcon,
    getUserName,
    getUserRole,
} = useUserInfo();


/* remove project user */
const { projectAPI } = useProjectApi();
const { mutateAsync: removeProjectUser } = useMutation({
    mutationFn: ({ projectId, userId }: {projectId: string; userId: string}) => projectAPI.removeUsers({
        project_id: projectId,
        users: [userId],
    }),
    onSuccess: (data) => {
        setQueryData(data);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'), true);
    },
});
const handleRemoveProjectUser = async (projectId: string, userId: string) => {
    removeProjectUser({
        projectId,
        userId,
    });
};

/* modal handling */
const handleCloseModal = () => {
    projectPageModalStore.closeProjectMemberModal();
};
const triggerInvite = ref(false);
const handleClickInvite = () => {
    const projectId = targetId.value as string;
    triggerInvite.value = true;
    projectPageModalStore.closeProjectMemberModal();
    projectPageModalStore.openProjectInviteMemberModal(projectId);
};
const handleClosedModal = () => {
    if (!triggerInvite.value) {
        projectPageModalStore.resetTarget();
    }
};
watch(visible, () => (v) => {
    if (v) {
        triggerInvite.value = false;
    }
});
</script>

<template>
    <p-button-modal :header-title="$t('PROJECT.DETAIL.MEMBER_TITLE')"
                    :visible="visible"
                    size="md"
                    hide-footer-close-button
                    @close="projectPageModalStore.closeProjectMemberModal"
                    @cancel="projectPageModalStore.closeProjectMemberModal"
                    @closed="handleClosedModal"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div v-if="targetId"
                 class="member-contents-wrapper"
            >
                <div class="member-contents">
                    <div class="contents-header">
                        <span>{{ $t('PROJECT.DETAIL.INVITE_MEMBER_DESC') }}</span>
                        <p-button v-if="projectType === 'PRIVATE'"
                                  icon-left="ic_plus_bold"
                                  style-type="tertiary"
                                  @click="handleClickInvite"
                        >
                            {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                        </p-button>
                    </div>
                    <div class="main-contents">
                        <div v-if="possibleUserIds.length">
                            <div v-for="(userId) in possibleUserIds"
                                 :key="userId"
                                 class="member-item"
                            >
                                <div class="left-contents">
                                    <p-lazy-img :src="getUserIcon(userId)"
                                                alt="user-icon"
                                                class="menu-icon"
                                                width="1.75rem"
                                                height="1.75rem"
                                    />
                                    <span>{{ userId }} <span v-if="!!getUserName(userId)">({{ getUserName(userId) }})</span></span>
                                </div>
                                <div class="right-contents">
                                    <span>{{ getUserRole(userId) }}</span>
                                    <p-icon-button name="ic_delete"
                                                   size="sm"
                                                   @click="handleRemoveProjectUser(targetId, userId)"
                                    />
                                </div>
                            </div>
                        </div>
                        <p-empty v-else
                                 class="project-member-empty"
                                 show-image
                                 :title="$t('PROJECT.DETAIL.MEMBER.NO_PROJECT_MEMBER')"
                        >
                            <template #image>
                                <img alt="illust_astronaut_radio"
                                     src="@/assets/images/img_ghost.png"
                                >
                            </template>
                        </p-empty>
                    </div>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('PROJECT.DETAIL.MEMBER.DONE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.member-contents-wrapper {
    @apply bg-violet-100;
    padding: 1rem;
    width: 100%;
    height: 25rem;
    .member-contents {
        @apply rounded-lg border border-violet-200 bg-white;
        padding: 0.75rem;
        height: 100%;

        .contents-header {
            @apply flex items-center justify-between text-label-md font-bold text-gray-900;
            padding-bottom: 0.5rem;
            height: 2.5rem;
        }
        .main-contents {
            @apply overflow-scroll;
            height: calc(100% - 2.5rem);
            .member-item {
                @apply flex items-center justify-between;
                padding: 0.5rem 0.25rem 0.5rem 0.5rem;
                .left-contents {
                    @apply flex items-center gap-2 text-label-md text-gray-900;
                    .menu-icon {
                        @apply rounded-full;
                    }
                }
                .right-contents {
                    @apply text-label-md text-gray-500 flex items-center gap-2;
                }
            }
            .project-member-empty {
                margin-top: 3rem;
            }
        }
    }
}
</style>
