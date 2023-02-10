<template>
    <p-pane-layout class="alert-detail-info border-none">
        <p-definition-table :fields="fields"
                            :data="data"
                            :skeleton-rows="10"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-info-description
                    :id="id"
                    :alert-data="data"
                    :manage-disabled="manageDisabled"
                    @update="$emit('update')"
                />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-severity="{value}">
                <p-badge outline
                         :background-color="ALERT_SEVERITY_COLORS[value]"
                >
                    {{ ALERT_SEVERITY[value] || value }}
                </p-badge>
            </template>
            <template #data-escalation_policy_id>
                <p-anchor :to="{ name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME }"
                          highlight
                >
                    {{ escalationPolicyName }}
                </p-anchor>
            </template>
            <template #data-project_id>
                <alert-info-project :id="id"
                                    :alert-data="data"
                                    :manage-disabled="manageDisabled"
                                    @update="$emit('update')"
                />
            </template>
            <template #data-triggered_by="{ value }">
                <alert-triggered-by :value="value"
                                    :project-id="data.project_id"
                                    :webhook-reference="webhooks[value]"
                                    :user-reference="users[value]"
                                    disable-link
                />
            </template>
            <template #data-account="{ value }">
                {{ value }}
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

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { PropType } from 'vue';

import {
    PPaneLayout, PDefinitionTable, PAnchor, PBadge,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertInfoDescription
    from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoDescription.vue';
import AlertInfoProject from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/modules/AlertInfoProject.vue';
import AlertTriggeredBy from '@/services/alert-manager/alert/modules/AlertTriggeredBy.vue';
import { ALERT_SEVERITY, ALERT_SEVERITY_COLORS } from '@/services/alert-manager/lib/config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { alertManagerStore } from '@/services/alert-manager/store';
import type { AlertDataModel } from '@/services/alert-manager/type';

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
            default: () => ({}) as PropType<AlertDataModel>,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
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
                { name: 'account', label: 'ACCOUNT_ID', copyValueFormatter: () => state.data.account },
                { name: 'reference.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
            ],
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
            data: computed(() => alertManagerStore.state.alert.alertData) || {},
            escalationPolicyName: '',
            loading: true,
            timezone: computed(() => store.state.user.timezone),
        });

        const getEscalationPolicy = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.escalationPolicy.get({
                    // eslint-disable-next-line camelcase
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
                store.dispatch('reference/user/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            iso8601Formatter,
            referenceRouter,
            ALERT_MANAGER_ROUTE,
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

/* custom design-system component - p-definition-table */
.p-definition-table {
    :deep(.p-definition) {
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
