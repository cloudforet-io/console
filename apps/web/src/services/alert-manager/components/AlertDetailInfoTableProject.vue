<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PLink, PButtonModal, PCopyButton,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useAlertInfoItem } from '@/services/alert-manager/composables/alert-info';
import { EDIT_MODE } from '@/services/alert-manager/constants/alert-constant';


const props = defineProps<{
    id?: string;
    alertData?: Record<string, any>;
    manageDisabled?: boolean;
}>();
const { getProperRouteLocation } = useProperRouteLocation();

const {
    state: alertDetailItemState,
    cancelEdit,
    startEdit,
    onClickSave,
} = useAlertInfoItem({
    alertId: props.id ?? '',
    isEditMode: false,
    dataForUpdate: props.alertData?.project_id,
});

const allReferenceStore = useAllReferenceStore();
const state = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    modalVisible: false,
});

const openModal = () => {
    state.modalVisible = true;
};

const onSelectProject = (selected) => {
    alertDetailItemState.dataForUpdate = selected[0]?.id;
};
</script>

<template>
    <fragment>
        <p v-if="!alertDetailItemState.isEditMode"
           class="content-wrapper"
        >
            <span class="project">
                <p-copy-button :value="props.alertData.project_id">
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            :to="getProperRouteLocation(referenceRouter(
                                props.alertData.project_id,
                                { resource_type: 'identity.Project' }))"
                            highlight
                    >
                        {{ state.projects[props.alertData.project_id] ? state.projects[props.alertData.project_id].label : props.alertData.project_id }}
                    </p-link>
                </p-copy-button>
            </span>
            <p-button style-type="tertiary"
                      size="sm"
                      class="add-button ml-2"
                      :disabled="props.manageDisabled"
                      @click="startEdit(props.alertData.project_id)"
            >
                {{ $t('MONITORING.ALERT.DETAIL.INFO.CHANGE') }}
            </p-button>
        </p>
        <div v-else
             class="content-wrapper"
        >
            <project-select-dropdown :selected-project-ids="alertDetailItemState.dataForUpdate ? [alertDetailItemState.dataForUpdate] : []"
                                     project-selectable
                                     :project-group-selectable="false"
                                     @select="onSelectProject"
            />
            <div class="button-group ml-2">
                <p-button style-type="secondary"
                          size="sm"
                          class="cancel-button"
                          @click="cancelEdit(props.alertData.project_id)"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          @click="openModal"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.INFO.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <p-button-modal
            :header-title="$t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_TITLE')"
            centered
            size="sm"
            fade
            backdrop
            theme-color="alert"
            :visible.sync="state.modalVisible"
            @confirm="onClickSave(EDIT_MODE.PROJECT)"
        >
            <template #body>
                <p class="modal-body">
                    {{ $t('MONITORING.ALERT.DETAIL.INFO.CHANGE_PROJECT_MODAL_DESC') }}
                </p>
            </template>
        </p-button-modal>
    </fragment>
</template>

<style lang="postcss" scoped>
@import './styles/alertInfoItem.pcss';
.modal-body {
    margin-top: 2rem;
}

/* custom project-select-dropdown */
:deep(.project-select-dropdown) {
    max-width: 25rem;
    flex-grow: 1;
}
</style>
