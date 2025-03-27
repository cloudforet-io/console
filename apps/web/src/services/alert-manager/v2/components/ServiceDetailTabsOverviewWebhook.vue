<script setup lang="ts">
import { useElementSize } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle, PIconButton, PLazyImg, PDivider, PTextButton, PDataLoader,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';

import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

const ITEM_DEFAULT_WIDTH = 184 + 8;
const DEFAULT_LEFT_PADDING = 16;

const rowItemsWrapperRef = ref<null | HTMLElement>(null);
const itemEl = ref<null | HTMLElement>(null);

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const { width: rowItemsWrapperWidth } = useElementSize(rowItemsWrapperRef);

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
});
const state = reactive({
    loading: true,
    pageStart: 0,
    items: [] as WebhookModel[],
    visibleCount: computed<number>(() => Math.floor((rowItemsWrapperWidth.value - DEFAULT_LEFT_PADDING) / ITEM_DEFAULT_WIDTH)),
    pageMax: computed<number>(() => Math.max(state.items.length - state.visibleCount, 0)),
});

const handleClickArrowButton = (increment: number) => {
    const element = {
        el: itemEl.value,
        defaultWidth: ITEM_DEFAULT_WIDTH,
    };
    if (!element.el) return;

    state.pageStart += increment;

    const marginLeft = increment * state.pageStart * element.defaultWidth;
    element.el.style.marginLeft = increment === 1 ? `-${marginLeft}px` : `${marginLeft}px`;
};
const handleRouteDetail = () => (
    serviceDetailPageStore.setCurrentTab(SERVICE_DETAIL_TABS.WEBHOOK)
);
const handleClickWebhookItem = (id: string) => {
    handleRouteDetail();
    serviceDetailPageStore.setSelectedWebhookId(id);
};

const fetchWebhookList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            service_id: storeState.serviceId,
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        });
        state.items = (results || []).slice(0, 15);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.serviceId, (serviceId) => {
    if (!serviceId) return;
    fetchWebhookList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-overview-webhook">
        <p-field-title class="field-title"
                       :label="$t('ALERT_MANAGER.WEBHOOK.TITLE')"
                       size="lg"
                       font-weight="regular"
        />
        <div ref="rowItemsWrapperRef"
             class="row-items-wrapper"
             :class="{'empty': !state.items.length}"
        >
            <p-data-loader :loading="state.loading"
                           :data="state.items"
            >
                <div ref="itemEl"
                     class="row-items-container"
                >
                    <div v-for="(item, idx) in state.items"
                         :key="`service-detail-webhook-item-${idx}`"
                         class="item"
                         @click="handleClickWebhookItem(item.webhook_id)"
                    >
                        <div class="image-wrapper">
                            <p-lazy-img :src="storeState.plugins[item.plugin_info.plugin_id] ? storeState.plugins[item.plugin_info.plugin_id].icon : 'ic_webhook'"
                                        width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_webhook"
                                        class="image"
                            />
                        </div>
                        <div class="text-wrapper">
                            <p class="text-label-md leading-8 truncate">
                                {{ item.name }}
                            </p>
                            <div class="text-label-sm text-gray-700">
                                <p>
                                    {{ $t('ALERT_MANAGER.WEBHOOK.REQUEST') }}
                                </p>
                                <p class="flex gap-2">
                                    <span>{{ $t('ALERT_MANAGER.WEBHOOK.TOTAL', { cnt: item.requests.total || 0 }) }}</span>
                                    <span class="text-red-400">{{ $t('ALERT_MANAGER.WEBHOOK.FAILED', { cnt: item.requests.error || 0 }) }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <p-icon-button v-if="state.pageStart !== 0"
                               class="arrow-button left"
                               name="ic_chevron-left"
                               color="inherit transparent"
                               width="1.5rem"
                               height="1.5rem"
                               @click="handleClickArrowButton(-1)"
                />
                <p-icon-button v-if="state.pageStart !== Number(state.pageMax)"
                               class="arrow-button right"
                               name="ic_chevron-right"
                               color="inherit transparent"
                               width="1.5rem"
                               height="1.5rem"
                               @click="handleClickArrowButton(1)"
                />
                <template #no-data>
                    <span class="text-violet-700 font-medium">{{ $t('ALERT_MANAGER.WEBHOOK.NO_DATA') }}</span>
                </template>
            </p-data-loader>
        </div>
        <p-divider class="bg-gray-150" />
        <div class="link-wrapper">
            <p-text-button style-type="highlight"
                           icon-right="ic_arrow-right"
                           @click="handleRouteDetail"
            >
                {{ $t('ALERT_MANAGER.SERVICE.DETAILS') }}
            </p-text-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-webhook {
    .field-title {
        padding: 1.375rem 1rem;
    }
    .row-items-wrapper {
        @apply relative overflow-hidden;
        padding-top: 0.75rem;
        padding-bottom: 1.75rem;
        &.empty {
            padding-top: 0;
        }
        .row-items-container {
            @apply flex overflow-hidden;
            gap: 0.5rem;
            padding-left: 1rem;
            transition: margin-left 0.3s ease;
            .image-wrapper {
                @apply flex items-center justify-center;
                width: 2rem;
                height: 2rem;
                padding: 0.375rem;
            }
            .text-wrapper {
                width: calc(100% - 2rem);
            }
            .item {
                @apply flex items-start border border-gray-150;
                width: 16rem;
                min-width: 16rem;
                padding: 0.5rem 0.5rem 0.75rem;
                border-radius: 0.75rem;
                &:hover {
                    @apply border border-secondary cursor-pointer;
                }
            }
        }
        &::after {
            @apply absolute;
            content: '';
            top: 0;
            right: 0;
            width: 2rem;
            height: 100%;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, theme('colors.white') 50%);
        }
        .arrow-button {
            @apply absolute bg-white border border-gray-300 rounded-full;
            top: calc(50% - 1rem);
            width: 2rem;
            height: 2rem;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            z-index: 10;
            &.left {
                margin-right: auto;
                left: 0.5rem;
            }
            &.right {
                margin-left: auto;
                right: 0.75rem;
            }
            &:hover, &:focus {
                @apply text-gray-900;
            }
        }
    }
    .link-wrapper {
        @apply flex items-center justify-center;
        padding-top: 0.625rem;
        padding-bottom: 0.75rem;
    }
}
</style>
