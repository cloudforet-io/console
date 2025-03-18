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
import { useProxyValue } from '@/common/composables/proxy-state';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';


interface Props {
    visible: boolean;
    targetId: string;
    isProject?: boolean;
    skipRedirect?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();

const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const recentStore = useRecentStore();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    title: computed(() => (props.isProject ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE'))),
    content: computed(() => (props.isProject ? _i18n.t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT') : _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT'))),
    loading: false,
});

const handleConfirmDelete = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
        if (props.isProject) {
            await deleteProject();
        } else {
            await deleteProjectGroup();
        }
        emit('confirm');
    } catch (e) {
        if (props.isProject) ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'));
        else ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: _i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }));
    } finally {
        state.loading = false;
        state.proxyVisible = false;
        if (!props.skipRedirect) {
            await router.replace({
                name: PROJECT_ROUTE_V1._NAME,
            });
        }
    }
};

const deleteProject = async () => {
    await SpaceConnector.clientV2.identity.project.delete<ProjectDeleteParameters>({
        project_id: props.targetId as string,
    });
    await recentStore.deleteRecent({
        type: RECENT_TYPE.PROJECT,
        itemId: props.targetId,
    });
    showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '');
    const isFavoriteItem = favoriteGetters.projectItems.find((item) => item.itemId === props.targetId);
    if (isFavoriteItem) {
        await favoriteStore.deleteFavorite({
            itemType: FAVORITE_TYPE.PROJECT,
            workspaceId: state.currentWorkspaceId || '',
            itemId: props.targetId as string,
        });
    }
};

const deleteProjectGroup = async () => {
    await SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>({
        project_group_id: props.targetId,
    });
    showSuccessMessage(_i18n.t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
    const isFavoriteItem = favoriteGetters.projectGroupItems.find((item) => item.itemId === props.targetId);
    if (isFavoriteItem) {
        await favoriteStore.deleteFavorite({
            itemType: FAVORITE_TYPE.PROJECT_GROUP,
            workspaceId: state.currentWorkspaceId || '',
            itemId: props.targetId,
        });
    }
};

</script>

<template>
    <delete-modal :header-title="state.title"
                  :visible.sync="state.proxyVisible"
                  :loading="state.loading"
                  @confirm="handleConfirmDelete"
    >
        <p>
            {{ state.content }}
        </p>
        <i18n v-if="!props.isProject"
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
