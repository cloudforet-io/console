<template>
    <p-pane-layout class="alert-detail-info">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="10"
                            :style-type="'white'"
                            :disable-copy="true"
        >
            <template #data-escalation_policy_id>
                <p-anchor :to="{ name: MONITORING_ROUTE.ALERT_MANAGER.ESCALATION_POLICY }" highlight>
                    {{ escalationPolicyName }}
                </p-anchor>
            </template>
            <template #data-project_id>
                <p class="content-wrapper">
                    <span class="project">
                        <p-anchor :to="referenceRouter(
                                      data.project_id,
                                      { resource_type: 'identity.Project' })"
                                  highlight
                        >
                            {{ projects[data.project_id] ? projects[data.project_id].label : data.project_id }}
                        </p-anchor>
                    </span>
                    <p-button style-type="gray-border" size="sm" @click="openChangeProjectModal">
                        {{ $t('MONITORING.ALERT.DETAIL.INFO.CHANGE') }}
                    </p-button>
                </p>
            </template>
            <template #data-created_at>
                {{ iso8601Formatter(data.created_at, timezone) }}
            </template>
            <template #data-acknowledged_at>
               <span v-if="data.acknowledged_at"> {{ iso8601Formatter(data.acknowledged_at, timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at>
                <span v-if="data.resolved_at"> {{ iso8601Formatter(data.resolved_at, timezone) }}</span>
                <span v-else>--</span>
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
            <template #data-rule="{value}">
                <p v-if="Object.keys(value).length === 0">
                    --
                </p>
                <p v-else>
                    {{ value }}
                </p>
            </template>
            <template #data-additional_info="{value}">
                <p v-if="Object.keys(value).length === 0">
                    --
                </p>
                <p v-else>
                    {{ value }}
                </p>
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
    PPaneLayout, PDefinitionTable, PButton, PI, PTextarea, PTextInput, PAnchor,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter } from '@/lib/util';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { AlertDataModel } from '@/views/monitoring/alert-manager/type';
import { ProjectItemResp } from '@/views/project/project/type';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { i18n } from '@/translations';

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
        PAnchor,
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
                { name: 'triggered_by', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY') },
                { name: 'escalation_policy_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY') },
                { name: 'project_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.PROJECT') },
                { name: 'severity', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.SEVERITY') },
                { name: 'created_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.CREATED') },
                { name: 'acknowledged_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED') },
                { name: 'resolved_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED') },
                { name: 'alert_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
                { name: 'description', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.DESC') },
                { name: 'rule', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RULE') },
                { name: 'status_message', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.STATUS_MSG') },
                { name: 'additional_info', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.EXTRA_INFO') },
            ],
            data: props.alertData || {},
            escalationPolicyName: '',
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            isDescriptionEditMode: false,
            isStatusMessageEditMode: false,
            descriptionInput: props.alertData?.description,
            statusMessageInput: props.alertData?.status_message,
            projects: computed(() => store.state.resource.project.items),
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
            if (data) {
                formState.loading = true;
                try {
                    await SpaceConnector.client.monitoring.alert.update({
                        alert_id: props.id,
                        project_id: data.id,
                    });
                    emit('update');
                } catch (e) {
                    console.error(e);
                } finally {
                    formState.loading = false;
                    formState.changeProjectModalVisible = false;
                }
            }
        };

        const updateDescription = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.id,
                    description: state.descriptionInput,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_DESCRIPTION'), '', root);
                state.isDescriptionEditMode = false;
                emit('update');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_DESCRIPTION'), e, root);
            }
        };

        const updateStatusMessage = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.id,
                    status_message: state.statusMessageInput,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_STATUS_MSG'), '', root);
                state.isStatusMessageEditMode = false;
                emit('update');
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_STATUS_MSG'), e, root);
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

        const getEscalationPolicy = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.escalationPolicy.get({
                    // eslint-disable-next-line camelcase
                    escalation_policy_id: state.data.escalation_policy_id,
                });
                state.escalationPolicyName = res.name;
            } catch (e) {
                console.error(e);
            }
        };

        (async () => {
            await store.dispatch('resource/project/load');
            await getEscalationPolicy();
        })();

        return {
            ...toRefs(state),
            formState,
            iso8601Formatter,
            referenceRouter,
            openChangeProjectModal,
            changeProject,
            EDIT_MODE,
            startEdit,
            cancelEdit,
            onClickSave,
            MONITORING_ROUTE,
        };
    },
};


</script>

<style lang="postcss" scoped>
.p-definition-table::v-deep {
    >>>.value-wrapper .value {
        width: 100%;
    }
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
