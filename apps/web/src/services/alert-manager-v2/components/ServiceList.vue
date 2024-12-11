<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDivider, PSelectCard, PToolbox, PI, PTextButton,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/src/controls/toolbox/type';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';

const pageSizeOptions = [15, 30, 45];

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
        ],
    }]),
    valueHandlerMap: {
        name: makeDistinctValueHandler('alert_manager.Service', 'name'),
    } as ValueHandlerMap,
});

const state = reactive({
    pageStart: 1,
    pageLimit: 15,
    serviceList: [] as ServiceModel[],
    queryTags: computed<QueryTag[]>(() => queryTagsHelper.queryTags.value),
});

const queryTagsHelper = useQueryTags({
    referenceStore: {},
    keyItemSets: handlerState.keyItemSets,
});

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagsHelper.setQueryTags(options.queryTags);
    if (options.pageLimit !== undefined) {
        state.pageLimit = options.pageLimit;
        state.pageStart = 1;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleClickServiceItem = (id: string) => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
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
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }));
};
const handleClickWebhookItem = (id: string, webhookId?: string) => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.WEBHOOK,
            webhookId,
        },
    }));
};

const fetchServiceList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>();
        state.serviceList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.serviceList = [];
    }
};

onMounted(() => {
    fetchServiceList();
});
</script>

<template>
    <div class="service-list">
        <p-toolbox search-type="query"
                   searchable
                   filters-visible
                   :page-size-options="pageSizeOptions"
                   :page-size="state.pageLimit"
                   :query-tags="state.queryTags"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChangeToolbox"
                   @refresh="fetchServiceList"
        />
        <div class="list-card-wrapper">
            <p-select-card v-for="(item, idx) in state.serviceList"
                           :key="`service-item-${idx}`"
                           class="card"
                           @change="handleClickServiceItem(item.service_id)"
            >
                <div class="card-inner-wrapper">
                    <p class="text-label-xl font-bold">
                        {{ item.name }}
                    </p>
                    <div class="contents">
                        <div class="alerts-wrapper">
                            <div class="alerts">
                                <p class="title text-gray-700">
                                    {{ $t('ALERT_MANAGER.SERVICE.OPEN_ALERTS') }}
                                </p>
                                <p class="count font-medium">
                                    {{ item?.alerts ? (item?.alerts.TOTAL.high + item?.alerts.TOTAL.low) : 0 }}
                                </p>
                            </div>
                            <p-divider />
                            <div class="alerts triggered text-red-500">
                                <p class="title">
                                    {{ $t('ALERT_MANAGER.ALERTS.TRIGGERED') }}
                                </p>
                                <div class="triggered-info">
                                    <p class="count">
                                        {{ item?.alerts?.TRIGGERRED ? (item?.alerts.TRIGGERRED.high + item?.alerts.TRIGGERRED.low) : 0 }}
                                    </p>
                                    <div class="ml-2">
                                        <p-i name="ic_error-filled"
                                             :color="red[400]"
                                             width="1rem"
                                             height="1rem"
                                        />
                                        <span class="text-gray-900 pl-1">{{ $t('ALERT_MANAGER.ALERTS.HIGH') }}:</span>
                                        <span> {{ item?.alerts?.TRIGGERRED ? item?.alerts.TRIGGERRED.high : 0 }}</span>
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
                                    <!-- TODO: check the link & icon -->
                                    <span v-for="(webhook, webhookIdx) in item.webhooks"
                                          :key="`webhook-item-${webhookIdx}`"
                                          class="webhook"
                                          @click.stop="handleClickWebhookItem(item.service_id, webhook)"
                                    >
                                        <p-i name="ic_check"
                                             class="icon success"
                                             height="0.875rem"
                                             width="0.875rem"
                                             color="inherit"
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
                                    {{ item.escalation_policy_id }}
                                </p-text-button>
                            </div>
                        </div>
                    </div>
                </div>
            </p-select-card>
        </div>
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
            min-width: 22.125rem;
            width: 28rem;
            max-width: 28rem;
            padding: 1.25rem 1.5rem 1.5rem;
            .card-inner-wrapper {
                @apply flex flex-col w-full;
                gap: 1.75rem;
                .contents {
                    @apply flex justify-between;
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
                        min-width: 7.75rem;
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
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
