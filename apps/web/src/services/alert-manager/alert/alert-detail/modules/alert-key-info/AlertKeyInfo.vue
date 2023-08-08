<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PDefinitionTable, PAnchor, PBadge,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';


import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertInfoDescription
    from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoDescription.vue';
import AlertInfoProject from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoProject.vue';
import AlertTriggeredBy from '@/services/alert-manager/alert/modules/AlertTriggeredBy.vue';
import { ALERT_SEVERITY, ALERT_SEVERITY_COLORS } from '@/services/alert-manager/lib/config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';


interface Props {
    id: string;
    manageDisabled: boolean;
}

withDefaults(defineProps<Props>(), {
    manageDisabled: false,
});
const emit = defineEmits(['update']);
const store = useStore();
const { t } = useI18n();

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.$state;

const state = reactive({
    fields: computed(() => [
        { name: 'description', label: t('MONITORING.ALERT.DETAIL.INFO.DESC'), disableCopy: true },
        { name: 'rule', label: t('MONITORING.ALERT.DETAIL.INFO.RULE'), disableCopy: true },
        { name: 'severity', label: t('MONITORING.ALERT.DETAIL.INFO.SEVERITY'), disableCopy: true },
        {
            name: 'escalation_policy_id',
            label: t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY'),
            copyValueFormatter: () => state.data.escalation_policy_id,
        },
        { name: 'project_id', label: t('MONITORING.ALERT.DETAIL.INFO.PROJECT'), disableCopy: true },
        {
            name: 'triggered_by',
            label: t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY'),
            copyValueFormatter: () => state.data.triggered_by,
        },
        { name: 'account', label: t('MONITORING.ALERT.DETAIL.INFO.ACCOUNT_ID'), copyValueFormatter: () => state.data.account },
        { name: 'resource.name', label: t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
    ]),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
    data: computed(() => alertPageState.alertData ?? {}),
    escalationPolicyName: '',
    loading: true,
    timezone: computed(() => store.state.user.timezone),
});

const getEscalationPolicy = async () => {
    try {
        const res = await SpaceConnector.client.monitoring.escalationPolicy.get({
            escalation_policy_id: state.data.escalation_policy_id,
        });
        state.escalationPolicyName = res.name;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicyName = '';
    }
};

const handleUpdate = (e) => {
    emit('update', e);
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        getEscalationPolicy(),
        store.dispatch('reference/webhook/load'),
        store.dispatch('reference/user/load'),
    ]);
})();

</script>

<template>
    <p-pane-layout class="alert-detail-info border-none">
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="10"
                            custom-key-width="10rem"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-info-description
                    :id="id"
                    :alert-data="state.data"
                    :manage-disabled="manageDisabled"
                    @update="handleUpdate"
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
                    {{ ALERT_SEVERITY[value] || value }}
                </p-badge>
            </template>
            <template #data-escalation_policy_id>
                <p-anchor :to="{ name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME }"
                          highlight
                >
                    {{ state.escalationPolicyName }}
                </p-anchor>
            </template>
            <template #data-project_id>
                <alert-info-project :id="id"
                                    :alert-data="state.data"
                                    :manage-disabled="manageDisabled"
                                    @update="handleUpdate"
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
