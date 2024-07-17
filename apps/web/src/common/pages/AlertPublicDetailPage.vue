<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import { map } from 'lodash';

import {
    PHeading, PBadge, PPaneLayout, PDefinitionTable, PLink, PTextBeautifier, PCollapsiblePanel, PCopyButton, PTab,
} from '@cloudforet/mirinae';
import { ACTION_ICON } from '@cloudforet/mirinae/src/inputs/link/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { AlertModel } from '@/schema/monitoring/alert/model';
import { i18n, setI18nLocale } from '@/translations';

import {
    ALERT_SEVERITY_COLORS,
    ALERT_SEVERITY_LABELS,
} from '@/services/alert-manager/constants/alert-constant';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const router = useRouter();

interface Props {
    alertUrl?: string;
    language?: string;
}

const props = defineProps<Props>();

const state = reactive({
    loading: true,
    alertData: {} as Partial<AlertModel>,
    alertId: '',
    duration: computed(() => calculateTime(state.alertData?.created_at)),
});

const tableState = reactive({
    fields: computed(() => [
        {
            name: 'description',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.DESC'),
            disableCopy: true,
        },
        {
            name: 'rule',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RULE'),
            disableCopy: true,
        },
        {
            name: 'severity',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.SEVERITY'),
            disableCopy: true,
        },
        {
            name: 'escalation_policy_id',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY'),
            copyValueFormatter: () => state.data.escalation_policy_id,
        },
        {
            name: 'project_id',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.PROJECT'),
            disableCopy: true,
        },
        {
            name: 'triggered_by',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY'),
            copyValueFormatter: () => state.data.triggered_by,
        },
        {
            name: 'account',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACCOUNT_ID'),
            copyValueFormatter: () => state.data.account,
        },
        {
            name: 'resource.name',
            label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME'),
        },
        {
            name: 'created_at',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.CREATED'),
            disableCopy: true,
        },
        {
            name: 'acknowledged_at',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED'),
            disableCopy: true,
        },
        {
            name: 'resolved_at',
            label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED'),
            disableCopy: true,
        },
    ]),
    escalationPolicyName: '',
    webhooks: {},
    timezone: 'UTC',
});

const tabState = reactive({
    tabs: computed(() => ([
        { name: 'details', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS') },
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
    // Fetch data
};


const setMetaTag = () => {
    const viewportEl = document.querySelector('head meta[name="viewport"]');
    if (viewportEl) (viewportEl as HTMLMetaElement).content = 'width=928';
};
const setRootTagStyle = () => {
    const htmlEl = document.querySelector('html');
    const bodyEl = document.querySelector('body');
    const appEl = document.querySelector('#app');
    if (htmlEl) {
        htmlEl.style.overflowY = 'auto';
    }
    if (bodyEl) bodyEl.style.height = 'unset';
    if (appEl) (appEl as HTMLElement).style.height = 'unset';
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

(async () => {
    setMetaTag();
    state.loading = true;
    await fetchData();
    await setI18nLocale(props.language ?? 'en');
    state.loading = false;
    setRootTagStyle();
})();

</script>

<template>
    <div class="body">
        <div class="alert-public-detail-page">
            <p-heading title="alertPageState.alertData?.title"
                       show-back-button
                       @click-back-button="router.go(-1)"
            >
                <template #title-right-extra>
                    <span class="alert-number">#{{ state.alertData?.alert_number }}</span>
                </template>
            </p-heading>
            <section class="detail-contents-wrapper">
                <div class="main-contents-wrapper">
                    <div class="main-contents">
                        <p-pane-layout class="alert-detail-summary">
                            <p class="content-wrapper">
                                <span class="title">{{ $t('MONITORING.ALERT.DETAIL.HEADER.STATE') }}</span>
                                <template v-if="state.alertData?.state !== ALERT_STATE.ERROR">
                                    {{ state.alertData?.state }}
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
                                {{ state.alertData?.urgency }}
                            </p>
                            <p class="content-wrapper">
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
                                                               :value="state.alertData.description"
                                            />&zwnj;
                                        </p-collapsible-panel>
                                    </div>
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
                                            :to="{ name: AUTH_ROUTE.SIGN_IN._NAME }"
                                            highlight
                                    >
                                        {{ tableState.escalationPolicyName }}
                                    </p-link>
                                </template>
                                <template #data-project_id>
                                    <p class="content-wrapper">
                                        <span class="project">
                                            <p-copy-button :value="state.alertData.project_id">
                                                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                                        new-tab
                                                        :to="{ name: AUTH_ROUTE.SIGN_IN._NAME }"
                                                        highlight
                                                >
                                                    {{ state.alertData?.project_id }}
                                                </p-link>
                                            </p-copy-button>
                                        </span>
                                    </p>
                                </template>
                                <template #data-account="{ value }">
                                    {{ value }}
                                </template>
                                <template #data-created_at>
                                    {{ iso8601Formatter(state.alertData.created_at, tableState.timezone) }}
                                </template>
                                <template #data-acknowledged_at>
                                    <span v-if="state.alertData.acknowledged_at"> {{ iso8601Formatter(state.alertData.acknowledged_at, tableState.timezone) }}</span>
                                    <span v-else>--</span>
                                </template>
                                <template #data-resolved_at>
                                    <span v-if="state.alertData.resolved_at"> {{ iso8601Formatter(state.alertData.resolved_at, tableState.timezone) }}</span>
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
                        <p-tab :tabs="tabState.tabs"
                               :active-tab.sync="tabState.activeTab"
                        >
                            <template #details>
                                <section>
                                    <p-heading heading-type="sub"
                                               :title="$t('PAGE_SCHEMA.BASE_INFO')"
                                    />
                                    <p-definition-table :fields="tabState.fields"
                                                        :data="state.alertData"
                                                        :skeleton-rows="7"
                                                        block
                                    >
                                        <template #data-rule="{value}">
                                            <span v-if="Object.keys(value).length === 0">
                                                --
                                            </span>
                                        </template>
                                    </p-definition-table>
                                    <p-heading heading-type="sub"
                                               :title="$t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO')"
                                    />
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
        </div>
        <div class="view-footer" />
    </div>
</template>

<style lang="postcss" scoped>
.body {
    padding: 1.5rem;
    .alert-public-detail-page {
        .alert-number {
            @apply text-gray-700;
            font-weight: 400;
            font-size: 1.5rem;
            margin-left: 0.25rem;
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
            .sub-contents-wrapper {
                @apply col-span-4;
                .sub-contents {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
            }

            @screen tablet {
                margin-top: 0;
                .main-contents-wrapper {
                    @apply row-start-1 row-end-1 col-span-12;
                }

                .sub-contents-wrapper {
                    @apply row-start-2 row-end-2 col-span-12;
                }
            }

            @screen mobile {
                .sub-contents-wrapper {
                    @apply col-span-12;
                    margin-top: -4rem;
                }
            }
        }
    }
}
</style>
