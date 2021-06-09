<template>
    <p-pane-layout class="alert-detail-info">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="10"
                            :stripe="false"
                            :disable-copy="true"
        >
            <template #data-project_id>
                <p class="content-wrapper">
                    <span class="project">{{ data.project_id }}</span>
                    <p-button style-type="gray-border" size="sm" @click="openChangeProjectModal">
                        Change
                    </p-button>
                </p>
            </template>
            <template #data-created_at>
                {{ iso8601Formatter(data.created_at, timezone) }}
            </template>
            <template #data-description>
                <p v-if="!isDescriptionEditMode" class="content-wrapper">
                    <span class="description">{{ data.description }}</span>
                    <button class="edit-btn" @click="startEdit(EDIT_MODE.DESCRIPTION)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </p>
                <div v-else class="content-wrapper">
                    <p-text-input v-model="descriptionInput" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button"
                                  size="sm" @click="cancelEdit(EDIT_MODE.DESCRIPTION)"
                        >
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            size="sm"
                            class="text-button"
                            @click="onClickSave(EDIT_MODE.DESCRIPTION)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
            </template>
            <template #data-status_message>
                <p v-if="!isStatusMessageEditMode" class="content-wrapper">
                    <span class="description">{{ data.status_message }}</span>
                    <button class="edit-btn" @click="startEdit(EDIT_MODE.STATUS_MSG)">
                        <p-i name="ic_edit" width="1rem" height="1rem"
                             color="inherit" class="edit-icon"
                        />
                        {{ $t('IDENTITY.USER.NOTIFICATION.EDIT') }}
                    </button>
                </p>
                <div v-else class="content-wrapper">
                    <p-textarea v-model="statusMessageInput" />
                    <div class="button-group">
                        <p-button :outline="true" class="text-button" size="sm"
                                  @click="cancelEdit(EDIT_MODE.STATUS_MSG)"
                        >
                            {{ $t('COMMON.TAGS.CANCEL') }}
                        </p-button>
                        <p-button
                            style-type="primary"
                            size="sm"
                            class="text-button"
                            @click="onClickSave(EDIT_MODE.STATUS_MSG)"
                        >
                            {{ $t('COMMON.TAGS.SAVE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-definition-table>
        <project-tree-modal :visible.sync="formState.changeProjectModalVisible"
                            :project-id="formState.projectId"
                            :loading="formState.loading"
                            @confirm="changeProject"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PDefinitionTable, PButton, PI, PTextarea, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter, showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import { AlertDataModel } from '@/views/monitoring/alert/type';
import { ProjectItemResp } from '@/views/project/project/type';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

const EDIT_MODE = {
    DESCRIPTION: 'description',
    STATUS_MSG: 'status_message',
} as const;
type EDIT_MODE = typeof EDIT_MODE[keyof typeof EDIT_MODE];

export default {
    name: 'AlertDetailInfo',
    components: {
        PPaneLayout,
        PDefinitionTable,
        PButton,
        PI,
        PTextInput,
        PTextarea,
        ProjectTreeModal,
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
    },
    setup(props: PropsType, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: [
                { name: 'triggered_by', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY') },
                { name: 'escalation_policy', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY') },
                { name: 'project_id', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.PROJECT') },
                { name: 'severity', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.SEVERITY') },
                { name: 'created_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.CREATED') },
                { name: 'acknowledged_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED') },
                { name: 'resolved_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.RESOLVED') },
                { name: 'alert_id', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
                { name: 'description', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.DESC') },
                { name: 'status_message', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.STATUS_DETAILS') },
            ],
            data: props.alertData || {},
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            isDescriptionEditMode: false,
            isStatusMessageEditMode: false,
            descriptionInput: props.alertData?.description,
            statusMessageInput: props.alertData?.status_message,
        });

        const formState = reactive({
            changeProjectModalVisible: false,
            loading: false,
            projectId: props.alertData?.project_id,
        });

        const openChangeProjectModal = () => {
            formState.changeProjectModalVisible = true;
        };

        const changeProject = async (data?: ProjectItemResp|null) => {
            // TODO: add API when backend structure fixed
            // if (data) {
            //     try {
            //         await SpaceConnector.client.monitoring.alert.update({
            //
            //         })
            //     }
            // }
        };

        const updateDescription = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.id,
                    description: state.descriptionInput,
                });
                showSuccessMessage('Update Description Success', '', root);
                state.isDescriptionEditMode = false;
                emit('update');
            } catch (e) {
                console.error(e);
                showErrorMessage('Update Description Failure', e, root);
            }
        };

        const updateStatusMessage = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.id,
                    status_message: state.statusMessageInput,
                });
                showSuccessMessage('Update Status Message Success', '', root);
                state.isStatusMessageEditMode = false;
                emit('update');
            } catch (e) {
                console.error(e);
                showErrorMessage('Update Status Message Failure', e, root);
            }
        };

        const startEdit = (editMode: EDIT_MODE) => {
            if (editMode === EDIT_MODE.DESCRIPTION) state.isDescriptionEditMode = true;
            else if (editMode === EDIT_MODE.STATUS_MSG) state.isStatusMessageEditMode = true;
        };

        const cancelEdit = (editMode: EDIT_MODE) => {
            if (editMode === EDIT_MODE.DESCRIPTION) state.isDescriptionEditMode = false;
            else if (editMode === EDIT_MODE.STATUS_MSG) state.isStatusMessageEditMode = false;
        };

        const onClickSave = async (editMode: EDIT_MODE) => {
            if (editMode === EDIT_MODE.DESCRIPTION) await updateDescription();
            else if (editMode === EDIT_MODE.STATUS_MSG) await updateStatusMessage();
        };

        return {
            ...toRefs(state),
            formState,
            iso8601Formatter,
            openChangeProjectModal,
            changeProject,
            EDIT_MODE,
            startEdit,
            cancelEdit,
            onClickSave,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-info {

}
.content-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.button-group {
    justify-content: flex-end;
    flex-shrink: 0;
    .text-button {
        height: 1.5rem;
    }
}
.edit-btn {
    @apply text-blue-600;
    padding-right: 0.5rem;
    line-height: 160%;
    .edit-icon {
        margin-right: 0.25rem;
    }
    &:hover, &:active {
        @apply cursor-pointer;
    }
}
</style>
