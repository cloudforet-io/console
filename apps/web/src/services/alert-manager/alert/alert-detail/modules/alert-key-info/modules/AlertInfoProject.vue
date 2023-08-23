<script lang="ts" setup>
import {
    PButton, PLink, PButtonModal, PCopyButton,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useAlertInfoItem } from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/composables';
import { EDIT_MODE } from '@/services/alert-manager/lib/config';
import type { AlertDataModel } from '@/services/alert-manager/type';

interface Props {
    id: string;
    alertData: AlertDataModel;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    alertData: () => ({}) as AlertDataModel,
    manageDisabled: false,
});

const store = useStore();
const { t } = useI18n();

const {
    state: alertDetailItemState,
    cancelEdit,
    startEdit,
    onClickSave,
} = useAlertInfoItem({
    alertId: props.id,
    isEditMode: false,
    dataForUpdate: props.alertData?.project_id,
});

const state = reactive({
    projects: computed(() => store.getters['reference/projectItems']),
    isModalLoading: true,
    modalVisible: false,
});

const openModal = () => {
    state.modalVisible = true;
};

const onSelectProject = (selected) => {
    alertDetailItemState.dataForUpdate = selected[0]?.id;
};

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/project/load');
})();

</script>

<template>
    <p v-if="!alertDetailItemState.isEditMode"
       class="content-wrapper"
    >
        <span class="project">
            <p-copy-button :value="alertData.project_id">
                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="referenceRouter(
                            alertData.project_id,
                            { resource_type: 'identity.Project' })"
                        highlight
                >
                    {{ state.projects[alertData.project_id] ? state.projects[alertData.project_id].label : alertData.project_id }}
                </p-link>
            </p-copy-button>
        </span>
        <p-button style-type="tertiary"
                  size="sm"
                  class="add-button ml-2"
                  :disabled="manageDisabled"
                  @click="startEdit(alertData.project_id)"
        >
            {{ t('MONITORING.ALERT.DETAIL.INFO.CHANGE') }}
        </p-button>
    </p>
    <div v-else
         class="content-wrapper"
    >
        <project-select-dropdown :selected-project-ids="alertDetailItemState.dataForUpdate ? [alertDetailItemState.dataForUpdate] : []"
                                 project-selectable
                                 class="dropdown"
                                 @select="onSelectProject"
        />
        <div class="button-group ml-2">
            <p-button style-type="secondary"
                      size="sm"
                      class="cancel-button"
                      @click="cancelEdit(alertData.project_id)"
            >
                {{ t('COMMON.TAGS.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="sm"
                      @click="openModal"
            >
                {{ t('MONITORING.ALERT.DETAIL.INFO.SAVE_CHANGES') }}
            </p-button>
        </div>
    </div>
    <p-button-modal v-model:visible="state.modalVisible"
                    :header-title="t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_TITLE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    theme-color="alert"
                    @confirm="onClickSave(EDIT_MODE.PROJECT)"
    >
        <template #body>
            <p class="modal-body">
                {{ t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_DESC') }}
            </p>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
@import '../styles/alertInfoItem.pcss';
.modal-body {
    margin-top: 2rem;
}

/* custom project-select-dropdown */
:deep(.project-select-dropdown) {
    max-width: 25rem;
    flex-grow: 1;
}
</style>
