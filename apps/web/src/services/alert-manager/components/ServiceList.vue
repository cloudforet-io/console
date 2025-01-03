<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

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

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import { gray } from '@/styles/colors';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { AlertManagementTableHandlerType } from '@/services/alert-manager/types/alert-manager-type';

const pageSizeOptions = [15, 30, 45];

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();

const { getProperRouteLocation } = useProperRouteLocation();
const { hasReadWriteAccess } = usePageEditableStatus();

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
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
});
const state = reactive({
    loading: true,
    totalCount: 0,
    serviceList: [] as ServiceModel[],
    escalationPolicyList: [] as EscalationPolicyModel[],
});

const serviceListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: SERVICE_SEARCH_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getWebhookIcon = (id: string): string|undefined => {
    const webhook = storeState.webhook[id].data;
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
const handleClickEscalationPolicy = (id: string, escalationPolicyId: string) => {
    if (id) {
        serviceDetailPageStore.setSelectedEscalationPolicyId(escalationPolicyId);
    }
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
            details: true,
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

onMounted(async () => {
    await fetchEscalationPolicy();
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
                        <div class="flex items-center justify-between">
                            <p class="flex-1 text-label-xl font-bold truncate">
                                {{ item.name }}
                            </p>
                            <p-i name="ic_chevron-right"
                                 width="1.5rem"
                                 height="1.5rem"
                                 :color="gray[500]"
                            />
                        </div>
                        <div class="contents">
                            <div class="flex flex-col flex-1 gap-4">
                                <div class="flex flex-col gap-3">
                                    <div class="alerts">
                                        <p class="title text-gray-700">
                                            {{ $t('ALERT_MANAGER.SERVICE.OPEN_ALERTS') }}
                                        </p>
                                        <p class="text-display-md font-medium">
                                            {{ (item?.alerts.TRIGGERED?.HIGH || 0) + (item?.alerts.TRIGGERED?.LOW || 0)
                                                + (item?.alerts.ACKNOWLEDGED?.HIGH || 0) + (item?.alerts.ACKNOWLEDGED?.LOW || 0) }}
                                        </p>
                                    </div>
                                    <div v-if="isEmpty(item?.alerts.TRIGGERED) || (item?.alerts.TRIGGERED?.HIGH === 0 && !item?.alerts.TRIGGERED?.LOW === 0)
                                             && isEmpty(item?.alerts.ACKNOWLEDGED) || (item?.alerts.ACKNOWLEDGED?.HIGH === 0 && item?.alerts.ACKNOWLEDGED?.LOW === 0)"
                                         class="flex h-11 pl-2"
                                    >
                                        <div class="alerts healthy text-green-600">
                                            <p class="title">
                                                {{ $t('ALERT_MANAGER.ALERTS.HEALTHY') }}
                                            </p>
                                        </div>
                                    </div>
                                    <div v-else
                                         class="flex justify-between pl-2 pr-2"
                                    >
                                        <div class="alerts triggered text-red-500">
                                            <p class="title">
                                                {{ $t('ALERT_MANAGER.ALERTS.TRIGGERED') }}
                                            </p>
                                            <div class="triggered-info">
                                                <p class="count">
                                                    {{ (item?.alerts.TRIGGERED?.HIGH || 0) + (item?.alerts.TRIGGERED?.LOW || 0) }}
                                                </p>
                                                <div class="ml-2 text-label-sm text-gray-700">
                                                    <span class="pl-1">{{ $t('ALERT_MANAGER.ALERTS.HIGH') }}:</span>
                                                    <span> {{ item?.alerts.TRIGGERED?.HIGH || 0 }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="alerts acknowledged text-gray-600">
                                            <p class="title">
                                                {{ $t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED') }}
                                            </p>
                                            <div class="triggered-info">
                                                <p class="count">
                                                    {{ (item?.alerts.ACKNOWLEDGED?.HIGH || 0) + (item?.alerts.ACKNOWLEDGED?.LOW || 0) }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p-divider class="block mt-1 mb-1" />
                                <div class="additional-info-wrapper">
                                    <div>
                                        <p class="title">
                                            {{ $t('ALERT_MANAGER.SERVICE.WEBHOOK', { cnt: item?.webhooks?.length || 0 }) }}
                                        </p>
                                        <div class="flex items-center">
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
                                    <div class="flex flex-col gap-1 items-end">
                                        <p class="title">
                                            {{ $t('ALERT_MANAGER.ESCALATION_POLICY.TITLE', { cnt: 11 }) }}
                                        </p>
                                        <p-text-button @click.stop="handleClickEscalationPolicy(item.service_id, item.escalation_policy_id)">
                                            <p class="truncate text-blue-700 pr-1 pl-1">
                                                {{ getEscalationPolicyName(item.escalation_policy_id) }}
                                            </p>
                                        </p-text-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-select-card>
            </div>
            <template #no-data>
                <div class="pt-12">
                    <p-empty show-image
                             :show-button="hasReadWriteAccess"
                    >
                        <template #image>
                            <img src="@/assets/images/img_jellyocto-with-a-telescope.png"
                                 alt="empty-image"
                            >
                        </template>
                        <template v-if="hasReadWriteAccess"
                                  #button
                        >
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
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
            .card-inner-wrapper {
                @apply flex flex-col w-full;
                gap: 1.25rem;
                .contents {
                    @apply flex gap-8;
                    .alerts {
                        @apply relative flex flex-col;
                        gap: 0.25rem;
                        width: calc(50% - 1rem);
                        &::before {
                            @apply absolute;
                            content: '';
                            width: 0.063rem;
                            height: 100%;
                            top: 0;
                            left: 0;
                        }
                        .title {
                            @apply text-label-md font-medium;
                        }
                        .count {
                            @apply text-display-sm;
                        }
                        .triggered-info {
                            @apply flex items-center;
                        }
                        &.triggered {
                            padding-left: 1rem;
                            &::before {
                                @apply bg-red-400;
                            }
                        }
                        &.acknowledged {
                            padding-left: 1rem;
                            &::before {
                                @apply bg-gray-300;
                            }
                        }
                        &.healthy {
                            @apply flex justify-center;
                            padding-left: 1rem;
                            &::before {
                                @apply bg-green-400;
                            }
                        }
                    }
                    .additional-info-wrapper {
                        @apply flex justify-between;
                        flex: 1;
                        .title {
                            @apply text-paragraph-md text-gray-600;
                        }
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
</style>
