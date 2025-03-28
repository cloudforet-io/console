<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import axios from 'axios';
import dayjs from 'dayjs';
import { map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PBadge, PPaneLayout, PDefinitionTable, PTextBeautifier, PCollapsiblePanel, PTab, PI, PButton,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { AlertModelV1 } from '@/schema/monitoring/alert/model';
import { i18n, setI18nLocale } from '@/translations';

import { ERROR_ROUTE } from '@/router/constant';

import { red } from '@/styles/colors';

import {
    ALERT_SEVERITY_COLORS,
    ALERT_SEVERITY_LABELS,
} from '@/services/alert-manager/v1/constants/alert-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const router = useRouter();

interface Props {
  alertUrl?: string;
  language?: string;
}

const props = defineProps<Props>();

interface PublicAlertModelV1 extends AlertModelV1 {
  project_name: string;
  domain_settings: {
    timezone: string;
    language: string;
  };
}

interface PublicAlertModel extends AlertModel {
  service_name: string;
  domain_settings: {
    timezone: string;
    language: string;
  }
}

const state = reactive({
    loading: true,
    alertVersion: '',
    alertData: {} as Partial<PublicAlertModelV1> & Partial<PublicAlertModel>,
    alertId: '',
    duration: computed(() => calculateTime(state.alertData?.created_at)),
    timezone: computed(() => state.alertData?.domain_settings?.timezone ?? 'UTC'),
    language: computed(() => state.alertData?.domain_settings?.language ?? 'en'),
});

const tableState = reactive({
    fields: computed(() => {
        let fieldPerVersion;
        if (state.alertVersion === 'v1') {
            fieldPerVersion = [
                { name: 'project_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.PROJECT'), disableCopy: true },
                { name: 'account', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACCOUNT_ID'), disableCopy: true },
                { name: 'responder', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESPONDER'), disableCopy: true },
            ];
        } else {
            fieldPerVersion = [
                { name: 'service_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.SERVICE'), disableCopy: true },
                { name: 'triggered_type', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_TYPE'), disableCopy: true },
                { name: 'acknowledged_by', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED_BY'), disableCopy: true },
                { name: 'resolved_by', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED_BY'), disableCopy: true },
            ];
        }
        return [
            { name: 'description', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.DESC'), disableCopy: true },
            { name: 'rule', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RULE'), disableCopy: true },
            { name: 'severity', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.SEVERITY'), disableCopy: true },
            { name: 'escalation_policy_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY'), disableCopy: true },
            { name: 'triggered_by', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY'), disableCopy: true },
            { name: 'resources', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE'), disableCopy: true },
            { name: 'created_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.CREATED'), disableCopy: true },
            { name: 'acknowledged_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED'), disableCopy: true },
            { name: 'resolved_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED'), disableCopy: true },
            ...fieldPerVersion,
        ];
    }),
    escalationPolicyName: computed(() => {
        if (state.alertVersion === 'v2') {
            return state.alertData.escalation_policy_name;
        }
        return '';
    }),
    webhooks: {},
    alertStateList: computed(() => ([
        { name: ALERT_STATE.TRIGGERED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.TRIGGERED') },
        { name: ALERT_STATE.ACKNOWLEDGED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.ACKNOWLEDGED') },
        { name: ALERT_STATE.RESOLVED, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.RESOLVED') },
    ])),
    alertUrgencyList: computed(() => ([
        { name: ALERT_URGENCY.HIGH, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.HIGH') },
        { name: ALERT_URGENCY.LOW, label: i18n.t('MONITORING.ALERT.DETAIL.HEADER.LOW') },
    ])),
});

const tabState = reactive({
    tabs: computed(() => ([
        { name: 'details', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO') },
    ] as TabItem[])),
    activeTab: 'details',
    fields: computed(() => [
        { name: 'alert_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
        { name: 'resource.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
        { name: 'resource.resource_id', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_ID') },
        { name: 'resource.resource_type', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_TYPE') },
    ]),
});

const additionalState = reactive({
    fields: computed(() => map(additionalState.data, (d, k) => ({ name: k, label: k })).sort((a, b) => a.label.localeCompare(b.label))),
    data: computed(() => state.alertData?.additional_info) || {},
});

const fetchData = async () => {
    const alertFetchUrl = router.currentRoute.query?.alert_url;
    if (alertFetchUrl) {
        try {
            const response = await axios.get(alertFetchUrl as string);
            state.alertData = response?.data;
            if (Object.keys(state.alertData).includes('version')
          && state.alertData.version === 'v2') {
                state.alertVersion = 'v2';
            } else if (!Object.keys(state.alertData).includes('version')) {
                state.alertVersion = 'v1';
            }
        } catch (e) {
            console.error(e);
            await router.push({ name: ERROR_ROUTE.EXPIRED_LINK._NAME });
        }
    }
};

const calculateTime = (time) => {
    const today = dayjs().toISOString();
    const createdTime = iso8601Formatter(time, 'UTC');
    const todayTime = iso8601Formatter(today, 'UTC');
    const timeForCalculate = dayjs(todayTime).diff(createdTime, 'minute');
    const days = Math.floor((timeForCalculate / 1440) % 365);
    const hours = Math.floor((timeForCalculate / 60) % 24);
    const minutes = Math.floor(timeForCalculate % 60);
    return `${days}d ${hours}h ${minutes}m`;
};

const handleRouteToSignInWithRedirectPath = () => {
    if (SpaceConnector.getRefreshToken()) {
        router.push({
            name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
            params: {
                id: state.alertData?.alert_id,
                workspaceId: state.alertData?.workspace_id,
            },
        });
        return;
    }
    router.push({
        name: AUTH_ROUTE.SIGN_IN._NAME,
        query: {
            redirectPath: `/workspace/${state.alertData?.workspace_id}/alert-manager/alert/${state.alertData?.alert_id}`,
        },
    });
};

(async () => {
    state.loading = true;
    await fetchData();
    await setI18nLocale(props.language ?? state.language ?? 'en');
    state.loading = false;
})();

</script>

<template>
    <div class="alert-public-detail-page">
        <p-heading class="mb-6"
                   :title="state.alertData?.title"
                   @click-back-button="router.go(-1)"
        >
            <template #title-right-extra>
                <span v-if="state.alertVersion === 'v1'"
                      class="alert-number"
                >#{{ state.alertData?.alert_number }}</span>
            </template>
        </p-heading>
        <section class="detail-contents-wrapper">
            <div class="main-contents-wrapper">
                <div class="main-contents">
                    <p-pane-layout class="alert-detail-summary">
                        <p class="content-wrapper">
                            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
                            <template v-if="state.alertVersion === 'v1' && state.alertData?.state !== ALERT_STATE.ERROR">
                                <span :class="{'text-alert': state.alertData.state === ALERT_STATE.TRIGGERED}">
                                    {{ tableState.alertStateList.find(d => d.name === state.alertData?.state)?.label }}
                                </span>
                            </template>
                            <template v-else-if="state.alertVersion === 'v2' && state.alertData?.status !== ALERT_STATE.ERROR">
                                <span :class="{'text-alert': state.alertData.status === ALERT_STATE.TRIGGERED}">
                                    {{ tableState.alertStateList.find(d => d.name === state.alertData?.status)?.label }}
                                </span>
                            </template>
                            <template v-else>
                                <p-badge style-type="alert"
                                         badge-type="solid"
                                         shape="square"
                                >
                                    {{ ALERT_STATE.ERROR }}
                                </p-badge>
                            </template>
                        </p>
                        <p class="content-wrapper">
                            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.URGENCY') }}</span>
                            <span class="selected-urgency">
                                <p-i v-if="state.alertData?.urgency === ALERT_URGENCY.HIGH"
                                     name="ic_error-filled"
                                     width="1em"
                                     height="1em"
                                     class="mr-2"
                                     :color="red[400]"
                                />
                                <p-i v-if="state.alertData?.urgency === ALERT_URGENCY.LOW"
                                     name="ic_warning-filled"
                                     width="1em"
                                     height="1em"
                                     class="mr-2"
                                     :color="red[200]"
                                />
                                {{ tableState.alertUrgencyList.find(d => d.name === state.alertData?.urgency)?.label }}
                            </span>
                        </p>
                        <p v-if="state.alertVersion === 'v1'"
                           class="content-wrapper"
                        >
                            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.ASSIGNED_TO') }}</span>
                            <span v-if="state.alertData?.assignee"
                                  class="email"
                            >{{ state.alertData?.assignee }}</span>
                            <span v-else>--</span>
                        </p>
                        <p class="content-wrapper">
                            <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.DURATION') }}</span>
                            <span class="time">{{ state.duration }}</span>
                        </p>
                    </p-pane-layout>

                    <p-pane-layout class="alert-detail-info-table">
                        <p-definition-table :fields="tableState.fields"
                                            :data="state.alertData"
                                            :skeleton-rows="10"
                                            custom-key-width="10rem"
                                            style-type="white"
                                            block
                        >
                            <template #data-description>
                                <div class="data-description">
                                    <p-collapsible-panel :line-clamp="10">
                                        <p-text-beautifier class="description"
                                                           :value="state.alertData.description ?? ''"
                                        />&zwnj;
                                    </p-collapsible-panel>
                                </div>
                            </template>
                            <template #data-rule="{value}">
                                <span v-if="Object.keys(value)?.length === 0">
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
                                {{ tableState.escalationPolicyName }}
                            </template>
                            <template #data-project_id>
                                <p class="content-wrapper">
                                    <span class="project">
                                        {{ state.alertData?.project_name ?? state.alertData?.project_id }}
                                    </span>
                                </p>
                            </template>
                            <template #data-account="{ value }">
                                {{ value }}
                            </template>
                            <template #data-resources="{ value }">
                                <span v-if="value?.length === 0">
                                    --
                                </span>
                                <template v-else>
                                    <p v-for="resource in value"
                                       :key="resource.resource_id"
                                       class="additional-info mb-1"
                                    >
                                        {{ resource.name }}
                                    </p>
                                </template>
                            </template>
                            <template #data-responder>
                                {{ state.alertData?.responder }}
                            </template>
                            <template #data-created_at>
                                {{ iso8601Formatter(state.alertData.created_at, state.timezone) }}
                            </template>
                            <template #data-acknowledged_at>
                                <span v-if="state.alertData.acknowledged_at"> {{ iso8601Formatter(state.alertData.acknowledged_at, state.timezone) }}</span>
                                <span v-else>--</span>
                            </template>
                            <template #data-resolved_at>
                                <span v-if="state.alertData.resolved_at"> {{ iso8601Formatter(state.alertData.resolved_at, state.timezone) }}</span>
                                <span v-else>--</span>
                            </template>
                            <template #data-service_id>
                                <p class="content-wrapper">
                                    <span class="service">
                                        {{ state.alertData?.service_name ?? state.alertData?.service_id }}
                                    </span>
                                </p>
                            </template>
                            <template #data-triggered_type>
                                <p-badge v-if="state.alertData.triggered_type === 'USER'"
                                         badge-type="solid-outline"
                                         style-type="indigo500"
                                >
                                    {{ state.alertData.triggered_type }}
                                </p-badge>
                                <p-badge v-else
                                         badge-type="solid-outline"
                                         style-type="gray900"
                                >
                                    {{ state.alertData.triggered_type }}
                                </p-badge>
                            </template>
                            <template #data-additional_info="{value}">
                                <span v-if="Object.keys(value)?.length === 0">
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
                    <p-tab :tabs="tabState.tabs"
                           :active-tab.sync="tabState.activeTab"
                    >
                        <template #details>
                            <section>
                                <p-definition-table :fields="additionalState.fields"
                                                    :data="additionalState.data"
                                                    :skeleton-rows="7"
                                                    block
                                />
                            </section>
                        </template>
                    </p-tab>
                </div>
            </div>
        </section>
        <div class="view-footer">
            <p-button style-type="primary"
                      class="sign-in-button"
                      @click="handleRouteToSignInWithRedirectPath"
            >
                {{ $t('MONITORING.ALERT.DETAIL.SIGN_IN_BUTTON') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-public-detail-page {
    padding: 1.5rem;
    margin-bottom: 4rem;
    overflow-y: auto;
    .alert-number {
        @apply text-gray-700;
        font-weight: 400;
        font-size: 1.5rem;
    }
    .detail-contents-wrapper {
        @apply grid grid-cols-12 gap-4 w-full;
        grid-auto-flow: row;
        grid-auto-rows: max-content;
        justify-content: center;

        .main-contents-wrapper {
            @apply col-span-12;
            .main-contents {
                display: flex;
                flex-direction: column;
                gap: 1rem;

                .alert-detail-summary {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem 1rem;
                    width: 100%;
                    max-width: 100%;
                    flex-wrap: wrap;

                    .content-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-width: 150px;
                        width: 100%;
                        max-width: calc(20% - 1rem);
                        .title {
                            @apply text-gray-500 font-bold;
                            font-size: 0.75rem;
                            line-height: 120%;
                            margin-bottom: 0.5rem;
                        }
                        .email {
                            @apply text-blue-900;
                            font-size: 0.875rem;
                            line-height: 155%;
                        }
                        .time {
                            @apply font-bold;
                            font-size: 1rem;
                            line-height: 155%;
                        }
                        .text-alert, .selected-urgency {
                            @apply flex items-center text-label-md;
                        }
                    }
                }

                .alert-detail-info-table {
                    overflow: hidden;
                    padding-bottom: 2.5rem;
                    .description {
                        white-space: pre-line;
                    }
                }
            }
        }

        @screen tablet {
            margin-top: 0;
            .main-contents-wrapper {
                grid-row-start: 1;
                grid-row-end: 1;
                grid-column: span 12 / span 12;
            }
        }
    }
    .view-footer {
        @apply fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200;
        height: 4rem;

        .sign-in-button {
            float: right;
        }
    }
}
</style>
