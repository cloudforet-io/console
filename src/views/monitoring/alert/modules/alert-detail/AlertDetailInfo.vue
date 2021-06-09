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
                test
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
import { PPaneLayout, PDefinitionTable, PButton } from '@spaceone/design-system';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import { AlertDataModel } from '@/views/monitoring/alert/type';
import { ProjectItemResp } from '@/views/project/project/type';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

export default {
    name: 'AlertDetailInfo',
    components: {
        PPaneLayout,
        PDefinitionTable,
        PButton,
        ProjectTreeModal,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
        alertData: {
            type: Object,
            default: null,
        },
    },
    setup(props: PropsType) {
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
            data: {},
            loading: true,
            timezone: store.state.user.timezone,
        });

        const formState = reactive({
            changeProjectModalVisible: false,
            loading: false,
            projectId: props.alertData.project_id,
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

        (async () => {
            state.data = props.alertData;
        })();

        return {
            ...toRefs(state),
            formState,
            iso8601Formatter,
            openChangeProjectModal,
            changeProject,
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
    width: 100%;
}
</style>
