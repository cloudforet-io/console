<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n as _i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const emit = defineEmits(['deleted']);

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.deleteModalVisible && !!projectPageModalStore.state.targetId);
const isProject = computed(() => projectPageModalStore.state.targetType === 'project');

const userWorkspaceStore = useUserWorkspaceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();

const state = reactive({
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    title: computed(() => (isProject.value ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE'))),
    content: computed(() => (isProject.value ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT'))),
    loading: false,
});

const handleConfirmDelete = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
        if (!projectPageModalStore.state.targetId) throw new Error('No project or project group id');
        if (projectPageModalStore.state.targetType === 'project') {
            await deleteProject(projectPageModalStore.state.targetId);
        } else {
            await deleteProjectGroup(projectPageModalStore.state.targetId);
        }
        emit('deleted');
    } catch (e) {
        if (projectPageModalStore.state.targetType === 'projectGroup') {
            ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }), true);
        } else {
            ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'), true);
        }
    } finally {
        state.loading = false;
        projectPageModalStore.closeDeleteModal();
    }
};

const queryClient = useQueryClient();
const { projectAPI } = useProjectApi();
const { key: projectListQueryKey } = useServiceQueryKey('identity', 'project', 'list');
const { withSuffix: projectQueryKeyWithSuffix } = useServiceQueryKey('identity', 'project', 'get');

const deleteProject = async (projectId: string) => {
    await projectAPI.delete({
        project_id: projectId,
    });
    queryClient.invalidateQueries({ queryKey: projectListQueryKey.value });
    queryClient.removeQueries({ queryKey: projectQueryKeyWithSuffix(projectId) });
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
const { projectGroupAPI } = useProjectGroupApi();
const { key: projectGroupListQueryKey } = useServiceQueryKey('identity', 'project-group', 'list');
const { withSuffix: projectGroupQueryKeyWithSuffix } = useServiceQueryKey('identity', 'project-group', 'get');
const deleteProjectGroup = async (projectGroupId: string) => {
    await projectGroupAPI.delete({
        project_group_id: projectGroupId,
    });
    queryClient.invalidateQueries({ queryKey: projectGroupListQueryKey.value });
    queryClient.removeQueries({ queryKey: projectGroupQueryKeyWithSuffix(projectGroupId) });
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
                  :visible="visible"
                  :loading="state.loading"
                  :confirm-text="$t('PROJECT.LANDING.DELETE')"
                  @close="projectPageModalStore.closeDeleteModal"
                  @cancel="projectPageModalStore.closeDeleteModal"
                  @closed="projectPageModalStore.resetTarget"
                  @confirm="handleConfirmDelete"
    >
        <p>
            {{ state.content }}
        </p>
        <i18n v-if="!isProject"
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
