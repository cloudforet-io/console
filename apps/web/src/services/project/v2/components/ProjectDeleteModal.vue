<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGroupDeleteParameters } from '@/api-clients/identity/project-group/schema/api-verbs/delete';
import type { ProjectDeleteParameters } from '@/api-clients/identity/project/schema/api-verbs/delete';
import { i18n as _i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


interface Props {
    skipRedirect?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'confirm'): void;
}>();

const projectPageModelStore = useProjectPageModalStore();

const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();

const state = reactive({
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    title: computed(() => (projectPageModelStore.state.targetId ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE'))),
    content: computed(() => (projectPageModelStore.state.targetId ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT'))),
    loading: false,
});

const handleConfirmDelete = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
        if (!projectPageModelStore.state.targetId) throw new Error('No project or project group id');
        if (projectPageModelStore.state.targetType === 'project') {
            await deleteProject(projectPageModelStore.state.targetId);
        } else {
            await deleteProjectGroup(projectPageModelStore.state.targetId);
        }
        emit('confirm');
    } catch (e) {
        if (projectPageModelStore.state.targetType === 'projectGroup') {
            ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }), true);
        } else {
            ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'), true);
        }
    } finally {
        state.loading = false;
        projectPageModelStore.closeDeleteModal();
        if (!props.skipRedirect) {
            await router.replace({
                name: PROJECT_ROUTE_V2._NAME,
            });
        }
    }
};

const deleteProject = async (projectId: string) => {
    await SpaceConnector.clientV2.identity.project.delete<ProjectDeleteParameters>({
        project_id: projectId,
    });
    await recentStore.deleteRecent({
        type: RECENT_TYPE.PROJECT,
        itemId: projectId,
    });
    showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
    const isFavoriteItem = favoriteGetters.projectItems.find((item) => item.itemId === projectId);
    if (isFavoriteItem) {
        await favoriteStore.deleteFavorite({
            itemType: FAVORITE_TYPE.PROJECT,
            workspaceId: state.currentWorkspaceId || '',
            itemId: projectId,
        });
    }
};

const deleteProjectGroup = async (projectGroupId: string) => {
    await SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>({
        project_group_id: projectGroupId,
    });
    showSuccessMessage(_i18n.t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
    const isFavoriteItem = favoriteGetters.projectGroupItems.find((item) => item.itemId === projectGroupId);
    if (isFavoriteItem) {
        await favoriteStore.deleteFavorite({
            itemType: FAVORITE_TYPE.PROJECT_GROUP,
            workspaceId: state.currentWorkspaceId || '',
            itemId: projectGroupId,
        });
    }
};

</script>

<template>
    <delete-modal :header-title="state.title"
                  :visible="projectPageModelStore.state.deleteModalVisible"
                  :loading="state.loading"
                  @close="projectPageModelStore.closeDeleteModal"
                  @cancel="projectPageModelStore.closeDeleteModal"
                  @closed="projectPageModelStore.resetTarget"
                  @confirm="handleConfirmDelete"
    >
        <p>
            {{ state.content }}
        </p>
        <i18n v-if="!projectPageModelStore.state.targetId"
              path="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC"
              tag="p"
              class="desc"
        >
            <template #deleteAllSubProjects>
                <strong>{{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DELETE_ALL_SUB_PROJECT') }}</strong>
            </template>
        </i18n>
    </delete-modal>
</template>

<style lang="postcss" scoped>
.delete-modal-contents {
    line-height: 1.4;
    .desc {
        @apply mt-1 text-gray-600;
        font-size: 0.875rem;
    }
}
</style>
