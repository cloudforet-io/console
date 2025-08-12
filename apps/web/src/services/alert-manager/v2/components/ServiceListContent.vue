<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PSelectCard, PI, PLazyImg, PDivider, PTextButton,
} from '@cloudforet/mirinae';

import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { gray, green } from '@/styles/colors';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    list: ServiceModel[];
    type: 'alert' | 'healthy';
}

const props = withDefaults(defineProps<Props>(), {
    list: undefined,
    type: undefined,
});

const serviceDetailPageStore = useServiceDetailPageStore();

const route = useRoute();
const router = useRouter();

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    isCollapsed: false,
    title: computed<TranslateResult>(() => {
        if (props.type === 'alert') {
            return i18n.t('ALERT_MANAGER.SERVICE.OPEN_ALERTS_SERVICE');
        }
        return i18n.t('ALERT_MANAGER.SERVICE.HEALTHY_SERVICE');
    }),
});

const getEscalationPolicyLabel = (id: string): string => referenceMap.alertManagerEscalationPolicy[id]?.label || '';
const getWebhookIcon = (id: string): string|undefined => {
    const webhook = referenceMap.alertManagerWebhook[id]?.data;
    if (!webhook) return undefined;
    return referenceMap.plugin[webhook.plugin_info.plugin_id]?.icon || '';
};
const handleClickCollapsibleTitle = () => {
    state.isCollapsed = !state.isCollapsed;
};
const handleClickServiceItem = (id: string) => {
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.OVERVIEW,
            filterService: route.query.serviceName,
        },
    }).catch(() => {});
};
const handleClickWebhookItem = (id: string, webhookId?: string) => {
    if (webhookId) {
        serviceDetailPageStore.setSelectedWebhookId(webhookId);
    }
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.WEBHOOK,
        },
    }).catch(() => {});
};
const handleClickEscalationPolicy = (id: string, escalationPolicyId: string) => {
    if (id) {
        serviceDetailPageStore.setSelectedEscalationPolicyId(escalationPolicyId);
    }
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
        params: {
            serviceId: id,
        },
        query: {
            tab: SERVICE_DETAIL_TABS.SETTINGS,
        },
    }).catch(() => {});
};
</script>

<template>
    <div class="service-list-content"
         :class="{ 'is-collapsed': state.isCollapsed }"
    >
        <div class="collapsible-title flex items-center font-medium"
             @click="handleClickCollapsibleTitle"
        >
            <p-i name="ic_chevron-down"
                 width="1.25rem"
                 height="1.25rem"
                 :color="gray[900]"
                 class="arrow-button"
            />
            <span>{{ state.title }}</span>
        </div>
        <div class="collapsible-contents">
            <p-select-card v-for="(item, idx) in props.list"
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
                        <div class="inner">
                            <div v-if="props.type === 'alert'"
                                 class="my-2"
                            >
                                <div class="flex justify-between px-2">
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
                                    <div class="alerts acknowledged text-gray-700">
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
                            <div v-else
                                 class="flex pt-1 pb-2"
                            >
                                <div class="flex items-center gap-2 text-green-600">
                                    <p-i name="ic_check_healthy"
                                         width="1.5rem"
                                         height="1.5rem"
                                         :color="green[600]"
                                    />
                                    <p class="title">
                                        {{ $t('ALERT_MANAGER.ALERTS.HEALTHY') }}
                                    </p>
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
                                        {{ $t('ALERT_MANAGER.SERVICE.DEFAULT_ESCALATION_POLICY', { cnt: 11 }) }}
                                    </p>
                                    <p-text-button @click.stop="handleClickEscalationPolicy(item.service_id, item.escalation_policy_id)">
                                        <p class="truncate text-blue-700 pr-1 pl-1">
                                            {{ getEscalationPolicyLabel(item.escalation_policy_id) }}
                                        </p>
                                    </p-text-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </p-select-card>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-list-content {
    @apply grid w-full;
    grid-template-columns: 1fr;
    gap: 1rem;
    .collapsible-title {
        width: fit-content;
        height: 2rem;
        cursor: pointer;
        margin-bottom: 0.25rem;
        padding: 0.375rem 0.75rem 0.375rem 0.25rem;
        .arrow-button {
            transition: transform 0.3s ease-in-out;
        }
        &:hover {
            @apply bg-gray-150;
            border-radius: 0.25rem;
        }
    }
    .collapsible-contents {
        opacity: 1;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
        gap: 1rem;
    }

    @media (min-width: 120rem) {
        .collapsible-contents {
            @apply grid grid-cols-4 gap-4;
        }
    }

    @screen laptop {
        .collapsible-contents {
            @apply grid grid-cols-3 gap-4;
        }
    }

    @screen tablet {
        .collapsible-contents {
            @apply grid grid-cols-2 gap-4;
        }
    }

    @screen mobile {
        .collapsible-contents {
            @apply grid grid-cols-1 gap-4;
        }
    }

    &.is-collapsed {
        .collapsible-title {
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .collapsible-contents {
            display: none;
            height: 0;
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0s ease;
        }
    }
    .card {
        width: 100%;
        min-width: 0;
        padding: 1.25rem 1.5rem 1rem 1.5rem;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        .card-inner-wrapper {
            @apply flex flex-col w-full;
            gap: 1.25rem;
            .contents {
                @apply flex gap-8;
                .inner {
                    @apply flex flex-col flex-1 gap-3;
                }
                .alerts {
                    @apply relative flex flex-col;
                    gap: 0.25rem;
                    width: calc(50% - 1rem);
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
                            @apply absolute bg-red-400 h-11;
                            content: '';
                            width: 0.063rem;
                            top: calc(50% - 1.375rem);
                            left: 0;
                        }
                    }
                    &.acknowledged {
                        padding-left: 1rem;
                        &::before {
                            @apply absolute bg-gray-400 h-11;
                            content: '';
                            width: 0.063rem;
                            top: calc(50% - 1.375rem);
                            left: 0;
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
</style>
