<template>
    <p-pane-layout class="alert-detail-info border-none">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="10"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-info-description :id="id" :alert-data="data" @update="$emit('update')" />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-severity="{value}">
                <p-badge outline :background-color="ALERT_SEVERITY_COLORS[value]">
                    {{ ALERT_SEVERITY[value] || value }}
                </p-badge>
            </template>
            <template #data-escalation_policy_id>
                <p-anchor :to="{ name: MONITORING_ROUTE.ALERT_MANAGER.ESCALATION_POLICY._NAME }" highlight>
                    {{ escalationPolicyName }}
                </p-anchor>
            </template>
            <template #data-project_id>
                <alert-info-project :id="id" :alert-data="data" @update="$emit('update')" />
            </template>
            <template #data-triggered_by="{ value }">
                <alert-triggered-by :value="value" :project-id="data.project_id" disable-link />
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
            <template #data-additional_info="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
                <template v-else>
                    <p v-for="([k, v]) in Object.entries(value)" :key="k" class="additional-info">
                        <b>{{ k }}</b>: {{ v }}
                    </p>
                </template>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PDefinitionTable, PAnchor, PBadge,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { AlertDataModel } from '@/services/monitoring/alert-manager/type';
import { MONITORING_ROUTE } from '@/services/monitoring/routes';
import { i18n } from '@/translations';
import AlertInfoProject from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoProject.vue';
import AlertInfoDescription
    from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoDescription.vue';
import { ALERT_SEVERITY, ALERT_SEVERITY_COLORS } from '@/services/monitoring/alert-manager/lib/config';
import AlertTriggeredBy from '@/services/monitoring/alert-manager/alert/modules/AlertTriggeredBy.vue';

interface Props {
    id: string;
    alertData: AlertDataModel;
}

const EDIT_MODE = {
    DESCRIPTION: 'description',
} as const;
type EDIT_MODE = typeof EDIT_MODE[keyof typeof EDIT_MODE];

export default {
    name: 'AlertKeyInfo',
    components: {
        AlertTriggeredBy,
        AlertInfoDescription,
        AlertInfoProject,
        PPaneLayout,
        PDefinitionTable,
        PAnchor,
        PBadge,
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
    setup(props: Props) {
        const state = reactive({
            fields: [
                { name: 'description', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.DESC'), disableCopy: true },
                { name: 'rule', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RULE'), disableCopy: true },
                { name: 'severity', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.SEVERITY'), disableCopy: true },
                {
                    name: 'escalation_policy_id',
                    label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY'),
                    copyValueFormatter: () => state.data.escalation_policy_id,
                },
                { name: 'project_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.PROJECT'), disableCopy: true },
                {
                    name: 'triggered_by',
                    label: i18n.t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY'),
                    copyValueFormatter: () => state.data.triggered_by,
                },
                { name: 'resource.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
            ],
            data: computed(() => store.state.service.alert.alertData) || {},
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
            ALERT_SEVERITY,
            ALERT_SEVERITY_COLORS,
        };
    },
};


</script>

<style lang="postcss" scoped>
.additional-info {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 140%;
}
.p-definition-table::v-deep {
    .p-definition {
        .key {
            @apply capitalize;
            width: 10rem;
        }
        .value-wrapper {
            max-width: calc(100% - 10rem);

            @screen tablet {
                max-width: none;
            }
        }
    }
}

</style>
