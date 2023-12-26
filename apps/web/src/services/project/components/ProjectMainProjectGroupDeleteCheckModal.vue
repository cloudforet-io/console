<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { i18n } from '@/translations';

import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';


const projectGroupStore = useProjectGroupReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;
const state = reactive({
    proxyVisible: computed({
        get() { return projectPageState.projectGroupDeleteCheckModalVisible; },
        set(val) { projectPageStore.setProjectGroupDeleteCheckModalVisible(val); },
    }),
    groupId: computed((() => projectPageGetters.actionTargetNodeData?.id)),
});

const deleteProjectGroup = async () => {
    try {
        await projectPageStore.deleteProjectGroup();
        await projectGroupStore.load({ force: true });
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: i18n.t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }));
    } finally {
        projectPageStore.setProjectGroupDeleteCheckModalVisible(false);
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
