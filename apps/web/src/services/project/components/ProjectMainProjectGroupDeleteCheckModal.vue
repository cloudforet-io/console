<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGroupDeleteParameters } from '@/schema/identity/project-group/api-verbs/delete';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

interface Props {
    visible: boolean;
    projectGroupId: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();

const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
});

const deleteProjectGroup = async () => {
    try {
        await SpaceConnector.clientV2.identity.projectGroup.delete<ProjectGroupDeleteParameters>({
            project_group_id: props.projectGroupId,
        });
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
        emit('confirm');
        const isFavoriteItem = favoriteGetters.projectGroupItems.find((item) => item.itemId === props.projectGroupId);
        if (isFavoriteItem) {
            await favoriteStore.deleteFavorite({
                itemType: FAVORITE_TYPE.PROJECT_GROUP,
                workspaceId: state.currentWorkspaceId || '',
                itemId: props.projectGroupId,
            });
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }));
    } finally {
        state.proxyVisible = false;
        await router.replace({
            name: PROJECT_ROUTE._NAME,
        });
    }
};
</script>

<template>
    <delete-modal :header-title="$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                  :visible.sync="state.proxyVisible"
                  @confirm="deleteProjectGroup"
    >
        <p>
            {{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT') }}
        </p>
        <i18n path="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC"
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
