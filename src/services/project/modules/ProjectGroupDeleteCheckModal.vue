<template>
    <delete-modal :header-title="$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                  :visible.sync="proxyVisible"
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

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectPageStore } from '@/services/project/store/project-page-store';

export default {
    name: 'ProjectGroupDeleteCheckModal',
    components: {
        DeleteModal,
    },
    setup() {
        const projectPageStore = useProjectPageStore();
        const projectPageState = projectPageStore.state;
        const projectPageGetters = projectPageStore.getters;
        const state = reactive({
            proxyVisible: computed({
                get() { return projectPageState.projectGroupDeleteCheckModalVisible; },
                set(val) { projectPageState.projectGroupDeleteCheckModalVisible = val; },
            }),
            groupId: computed((() => projectPageGetters.actionTargetNodeData?.id)),
        });

        const deleteProjectGroup = async () => {
            try {
                await projectPageStore.deleteProjectGroup();
                // await store.dispatch('favorite/projectGroup/removeItem', { id: state.groupId });
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }));
            } finally {
                projectPageState.projectGroupDeleteCheckModalVisible = false;
            }
        };
        return {
            ...toRefs(state),
            deleteProjectGroup,
        };
    },
};
</script>

<style lang="postcss" scoped>
.delete-modal-contents {
    line-height: 1.4;
    .desc {
        @apply mt-1 text-gray-600;
        font-size: 0.875rem;
    }
}
</style>
