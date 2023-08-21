<template>
    <fragment>
        <p v-if="!isEditMode"
           class="content-wrapper"
        >
            <span class="project">
                <p-copy-button :value="alertData.project_id">
                    <p-link :to="referenceRouter(
                                alertData.project_id,
                                { resource_type: 'identity.Project' })"
                            highlight
                    >
                        {{ projects[alertData.project_id] ? projects[alertData.project_id].label : alertData.project_id }}
                    </p-link>
                </p-copy-button>
            </span>
            <p-button style-type="tertiary"
                      size="sm"
                      class="add-button ml-2"
                      :disabled="manageDisabled"
                      @click="startEdit(alertData.project_id)"
            >
                {{ $t('MONITORING.ALERT.DETAIL.INFO.CHANGE') }}
            </p-button>
        </p>
        <div v-else
             class="content-wrapper"
        >
            <project-select-dropdown :selected-project-ids="dataForUpdate ? [dataForUpdate] : []"
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
            :visible.sync="modalVisible"
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

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PLink, PButtonModal, PCopyButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useAlertInfoItem } from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/composables';
import { EDIT_MODE } from '@/services/alert-manager/lib/config';

export default {
    name: 'AlertInfoProject',
    components: {
        ProjectSelectDropdown,
        PLink,
        PButton,
        PButtonModal,
        PCopyButton,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
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

        return {
            EDIT_MODE,
            ...toRefs(alertDetailItemState),
            ...toRefs(state),
            referenceRouter,
            cancelEdit,
            startEdit,
            onClickSave,
            onSelectProject,
            openModal,
        };
    },
};
</script>

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
