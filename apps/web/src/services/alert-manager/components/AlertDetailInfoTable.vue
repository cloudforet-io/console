<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PPaneLayout, PDefinitionTable, PLink, PBadge,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { iso8601Formatter } from '@cloudforet/utils';

import type { AlertSeverity } from '@/schema/monitoring/alert/type';
import type { EscalationPolicyGetParameters } from '@/schema/monitoring/escalation-policy/api-verbs/get';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import {
    blue, coral, gray, red, violet, yellow,
} from '@/styles/colors';

import AlertDetailInfoTableDescription
    from '@/services/alert-manager/components/AlertDetailInfoTableDescription.vue';
import AlertDetailInfoTableProject from '@/services/alert-manager/components/AlertDetailInfoTableProject.vue';
import AlertTriggeredBy from '@/services/alert-manager/components/AlertMainDataTableTriggeredByField.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';


const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
    CRITICAL: 'Critical',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    NOT_AVAILABLE: 'Not Available',
    NONE: 'None',
};
const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
    CRITICAL: red[600],
    ERROR: coral[600],
    WARNING: yellow[600],
    INFO: blue[600],
    NOT_AVAILABLE: violet[800],
    NONE: gray[500],
};

const props = defineProps<{
    id?: string;
    manageDisabled?: boolean;
}>();

const allReferenceStore = useAllReferenceStore();
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const { getProperRouteLocation } = useProperRouteLocation();


const state = reactive({
    fields: computed(() => [
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
        { name: 'account', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACCOUNT_ID'), copyValueFormatter: () => state.data.account },
        { name: 'resource.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
        { name: 'created_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.CREATED'), disableCopy: true },
        { name: 'acknowledged_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED'), disableCopy: true },
        { name: 'resolved_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED'), disableCopy: true },
    ]),
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
    data: computed(() => alertPageState.alertData ?? {}),
    escalationPolicyName: '',
    timezone: computed(() => store.state.user.timezone),
});

const getEscalationPolicy = async () => {
    try {
        if (!state.data.escalation_policy_id) throw new Error('escalation_policy_id is required');
        const res = await SpaceConnector.clientV2.monitoring.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>({
            escalation_policy_id: state.data.escalation_policy_id,
        });
        state.escalationPolicyName = res.name;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicyName = '';
    }
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        getEscalationPolicy(),
        store.dispatch('reference/webhook/load'),
    ]);
})();

</script>

<template>
    <p-pane-layout class="border-none">
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="10"
                            custom-key-width="10rem"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-detail-info-table-description
                    :id="props.id"
                    :alert-data="state.data"
                    :manage-disabled="props.manageDisabled"
                    @update="$emit('update')"
                />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-severity="{value}">
                <p-badge background-color="white"
                         :text-color="ALERT_SEVERITY_COLORS[value]"
                         :outline-color="ALERT_SEVERITY_COLORS[value]"
                >
                    {{ ALERT_SEVERITY_LABELS[value] || value }}
                </p-badge>
            </template>
            <template #data-escalation_policy_id>
                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="getProperRouteLocation({ name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME })"
                        highlight
                >
                    {{ state.escalationPolicyName }}
                </p-link>
            </template>
            <template #data-project_id>
                <alert-detail-info-table-project
                    :id="props.id"
                    :alert-data="state.data"
                    :manage-disabled="props.manageDisabled"
                    @update="$emit('update')"
                />
            </template>
            <template #data-triggered_by="{ value }">
                <alert-triggered-by :value="value"
                                    :project-id="state.data.project_id"
                                    :webhook-reference="state.webhooks[value]"
                                    :user-reference="state.users[value]"
                                    disable-link
                />
            </template>
            <template #data-account="{ value }">
                {{ value }}
            </template>
            <template #data-created_at>
                {{ iso8601Formatter(state.data.created_at, state.timezone) }}
            </template>
            <template #data-acknowledged_at>
                <span v-if="state.data.acknowledged_at"> {{ iso8601Formatter(state.data.acknowledged_at, state.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at>
                <span v-if="state.data.resolved_at"> {{ iso8601Formatter(state.data.resolved_at, state.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-additional_info="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
                <template v-else>
                    <p v-for="([k, v]) in Object.entries(value)"
                       :key="k"
                       class="additional-info"
                    >
                        <b>{{ k }}</b>: {{ v }}
                    </p>
                </template>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.additional-info {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 140%;
}

/* custom design-system component - p-definition-table */
.p-definition-table {
    :deep(.p-definition) {
        .key {
            @apply capitalize;
        }
    }
}

</style>
