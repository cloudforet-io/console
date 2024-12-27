<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PSelectCard, PToolbox, PI, PTextButton, PDataLoader, PEmpty, PButton, PLazyImg,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/src/controls/toolbox/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { AlertManagementTableHandlerType } from '@/services/alert-manager/types/alert-manager-type';

const pageSizeOptions = [15, 30, 45];

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();

const { getProperRouteLocation } = useProperRouteLocation();

const router = useRouter();

const SERVICE_SEARCH_HANDLER: AlertManagementTableHandlerType = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.Service', 'name'),
    },
};

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    loading: true,
    totalCount: 0,
    serviceList: [] as ServiceModel[],
    escalationPolicyList: [] as EscalationPolicyModel[],
    webhookList: [] as WebhookModel[],
});

const serviceListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: SERVICE_SEARCH_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getWebhookIcon = (id: string): string|undefined => {
    const webhook = state.webhookList.find((item) => item.webhook_id === id);
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};
const getEscalationPolicyName = (id: string): string => {
    const escalationPolicy = state.escalationPolicyList.find((item) => item.escalation_policy_id === id);
    return escalationPolicy?.name || '';
};
const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) serviceListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) serviceListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchServiceList();
};
const handleClickServiceItem = (id: string) => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.OVERVIEW,
        },
    }));
};
const handleClickEscalationPolicy = (id: string) => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }));
};
const handleClickWebhookItem = (id: string, webhookId?: string) => {
    if (webhookId) {
        serviceDetailPageStore.setSelectedWebhookId(webhookId);
    }
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.WEBHOOK,
        },
    }));
};
const handleClickCreateButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
    }));
};

const fetchServiceList = async () => {
    state.loading = true;
    try {
        serviceListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>({
            query: serviceListApiQueryHelper.data,
        });
        state.serviceList = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.serviceList = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const fetchEscalationPolicy = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>();
        state.escalationPolicyList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicyList = [];
    }
};
const fetchWebhookList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>();
        state.webhookList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookList = [];
    }
};

onMounted(async () => {
    await fetchEscalationPolicy();
    await fetchWebhookList();
    await fetchServiceList();
});
</script>

<template>
    <div class="service-list">
        <p-toolbox search-type="query"
                   searchable
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="15"
                   :query-tags="queryTags"
                   :key-item-sets="SERVICE_SEARCH_HANDLER.keyItemSets"
                   :value-handler-map="SERVICE_SEARCH_HANDLER.valueHandlerMap"
                   :total-count="state.totalCount"
                   @change="handleChangeToolbox"
                   @refresh="fetchServiceList"
        />
        <p-data-loader :loading="state.loading"
                       :data="state.serviceList"
                       loader-backdrop-color="transparent"
        >
            <div class="list-card-wrapper">
                <p-select-card v-for="(item, idx) in state.serviceList"
                               :key="`service-item-${idx}`"
                               class="card"
                               @change="handleClickServiceItem(item.service_id)"
                >
                    <div class="card-inner-wrapper">
                        <p class="text-label-xl font-bold truncate">
                            {{ item.name }}
                        </p>
                        <div class="contents">
                            <div class="alerts-wrapper">
                                <div class="alerts">
                                    <p class="title text-gray-700">
                                        {{ $t('ALERT_MANAGER.SERVICE.OPEN_ALERTS') }}
                                    </p>
                                    <p class="count font-medium">
                                        {{ (item?.alerts.TOTAL?.high || 0) + (item?.alerts.TOTAL?.low || 0) }}
                                    </p>
                                </div>
                                <p-divider />
                                <div class="alerts triggered text-red-500">
                                    <p class="title">
                                        {{ $t('ALERT_MANAGER.ALERTS.TRIGGERED') }}
                                    </p>
                                    <div class="triggered-info">
                                        <p class="count">
                                            {{ (item?.alerts.TRIGGERED?.high || 0) + (item?.alerts.TRIGGERED?.low || 0) }}
                                        </p>
                                        <div class="ml-2">
                                            <p-i name="ic_error-filled"
                                                 :color="red[400]"
                                                 width="1rem"
                                                 height="1rem"
                                            />
                                            <span class="text-gray-900 pl-1">{{ $t('ALERT_MANAGER.ALERTS.HIGH') }}:</span>
                                            <span> {{ item?.alerts.TRIGGERED?.high || 0 }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="additional-info-wrapper">
                                <div>
                                    <p class="title">
                                        {{ $t('ALERT_MANAGER.SERVICE.WEBHOOK', { cnt: item?.webhooks?.length || 0 }) }}
                                    </p>
                                    <div class="webhook-list">
                                        <span v-for="(webhook, webhookIdx) in item.webhooks?.slice(0,5)"
                                              :key="`webhook-item-${webhookIdx}`"
                                              class="webhook"
                                              @click.stop="handleClickWebhookItem(item.service_id, webhook)"
                                        >
                                            <p-lazy-img :src="getWebhookIcon(webhook)"
                                                        error-icon="ic_webhook"
                                                        width="0.875rem"
                                                        height="0.875rem"
                                                        class="icon"
                                            />
                                        </span>
                                        <span class="webhook chevron"
                                              @click.stop="handleClickWebhookItem(item.service_id)"
                                        >
                                            <p-i
                                                name="ic_chevron-right"
                                                width="1.125rem"
                                                height="1.125rem"
                                                color="inherit"
                                            />
                                        </span>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <p class="title">
                                        {{ $t('ALERT_MANAGER.ESCALATION_POLICY.TITLE', { cnt: 11 }) }}
                                    </p>
                                    <p-text-button @click.stop="handleClickEscalationPolicy(item.service_id)">
                                        {{ getEscalationPolicyName(item.escalation_policy_id) }}
                                    </p-text-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-select-card>
            </div>
            <template #no-data>
                <div class="pt-12">
                    <p-empty show-image
                             show-button
                    >
                        <template #image>
                            <img src="@/assets/images/img_jellyocto-with-a-telescope.png"
                                 alt="empty-image"
                            >
                        </template>
                        <template #button>
                            <p-button icon-left="ic_plus_bold"
                                      @click="handleClickCreateButton"
                            >
                                {{ $t('ALERT_MANAGER.SERVICE.NO_DATA') }}
                            </p-button>
                        </template>
                        {{ $t('ALERT_MANAGER.SERVICE.NO_DATA') }}
                    </p-empty>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.service-list {
    @apply flex flex-col;
    gap: 0.5rem;
    .list-card-wrapper {
        @apply flex flex-wrap;
        gap: 1rem;
        .card {
            width: 28rem;
            max-width: 28rem;
            padding: 1.25rem 1.5rem 1.5rem;
            .card-inner-wrapper {
                @apply flex flex-col w-full;
                gap: 1.75rem;
                .contents {
                    @apply flex gap-8;
                    .alerts-wrapper {
                        @apply flex flex-col;
                        flex: 1;
                        max-width: 12.25rem;
                        gap: 0.75rem;
                        .alerts {
                            @apply relative flex flex-col;
                            gap: 0.25rem;
                            .title {
                                @apply text-label-md;
                            }
                            .count {
                                @apply text-display-md;
                            }
                            .triggered-info {
                                @apply flex items-center;
                            }
                            &.triggered {
                                padding-left: 0.625rem;
                                &::before {
                                    @apply absolute bg-red-500;
                                    content: '';
                                    width: 0.125rem;
                                    height: 100%;
                                    top: 0;
                                    left: 0;
                                }
                            }
                        }
                    }
                    .additional-info-wrapper {
                        flex: 1;
                        .title {
                            @apply text-paragraph-md text-gray-600;
                        }
                        .webhook-list {
                            @apply flex items-center;
                            .webhook {
                                @apply flex items-center justify-center rounded-full bg-gray-100 border border-white ;
                                width: 1.5rem;
                                height: 1.5rem;
                                &:hover {
                                    @apply bg-blue-200;
                                }
                                & + .webhook {
                                    margin-left: -0.25rem;
                                }
                                &.chevron {
                                    @apply border-gray-200;
                                }
                                .icon {
                                    margin-bottom: 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
