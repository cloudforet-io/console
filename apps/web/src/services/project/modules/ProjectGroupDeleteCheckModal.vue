<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectPageStore } from '@/services/project/store/project-page-store';

const { t } = useI18n();

const projectPageStore = useProjectPageStore();
const state = reactive({
    proxyVisible: computed({
        get() { return projectPageStore.projectGroupDeleteCheckModalVisible; },
        set(val) { projectPageStore.$patch({ projectGroupDeleteCheckModalVisible: val }); },
    }),
    groupId: computed((() => projectPageStore.actionTargetNodeData?.id)),
});

const deleteProjectGroup = async () => {
    try {
        await projectPageStore.deleteProjectGroup();
        // await store.dispatch('favorite/projectGroup/removeItem', { id: state.groupId });
        showSuccessMessage(t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }));
    } finally {
        projectPageStore.$patch({ projectGroupDeleteCheckModalVisible: false });
    }
};

</script>

<template>
    <delete-modal v-model:visible="state.proxyVisible"
                  :header-title="t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                  @confirm="deleteProjectGroup"
    >
        <p>
            {{ t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT') }}
        </p>
        <i18n-t keypath="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC"
                tag="p"
                class="desc"
        >
            <template #deleteAllSubProjects>
                <strong>{{ t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DELETE_ALL_SUB_PROJECT') }}</strong>
            </template>
        </i18n-t>
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
