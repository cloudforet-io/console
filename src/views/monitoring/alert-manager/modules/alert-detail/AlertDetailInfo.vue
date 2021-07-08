<template>
    <p-pane-layout class="alert-detail-info border-none">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="10"
                            style-type="white"
                            :disable-copy="true"
        >
            <template #data-escalation_policy_id>
                <p-anchor :to="{ name: MONITORING_ROUTE.ALERT_MANAGER.ESCALATION_POLICY }" highlight>
                    {{ escalationPolicyName }}
                </p-anchor>
            </template>
            <template #data-project_id>
                <alert-detail-info-project :id="id" :alert-data="data" @update="$emit('update')" />
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
                <alert-detail-info-description :id="id" :alert-data="data" @update="$emit('update')" />
            </template>
            <template #data-status_message>
                <alert-detail-info-status-msg :id="id" :alert-data="data" @update="$emit('update')" />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-additional_info="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
                <template v-else>
                    <p v-for="([k, v]) in Object.entries(value)" class="additional-info">
                        <b>{{ k }}</b>: {{ v }}
                    </p>
                </template>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PDefinitionTable, PButton, PI, PTextarea, PTextInput, PAnchor,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { AlertDataModel } from '@/views/monitoring/alert-manager/type';
import { ProjectItemResp } from '@/views/project/project/type';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { i18n } from '@/translations';
import AlertDetailInfoProject from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailInfoProject.vue';
import AlertDetailInfoStatusMsg
    from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailInfoStatusMsg.vue';
import AlertDetailInfoDescription
    from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailInfoDescription.vue';

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
        AlertDetailInfoDescription,
        AlertDetailInfoStatusMsg,
        AlertDetailInfoProject,
        PPaneLayout,
        PDefinitionTable,
        PAnchor,
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
            projects: computed(() => store.state.resource.project.items),
        });

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
            iso8601Formatter,
            referenceRouter,
            EDIT_MODE,
            MONITORING_ROUTE,
        };
    },
};


</script>

<style lang="postcss" scoped>
.p-definition-table::v-deep {
    .def-row {
        tr {
            >>> .value {
                width: 100%;

                >>>.p-copy-button {
                    width: 100%;
                }
            }
        }
    }
}

.additional-info {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 140%;
}

</style>
