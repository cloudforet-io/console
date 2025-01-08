<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PPaneLayout, PI, PSearch, PTreeView, PLazyImg, screens,
} from '@cloudforet/mirinae';

import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { useProxyValue } from '@/common/composables/proxy-state';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { TreeNode, TreeDisplayMap } from '@/services/project/tree/type';

interface Props {
    hideSidebar: boolean;
    items: EventRuleModel[];
}

const props = withDefaults(defineProps<Props>(), {
    hideSidebar: false,
    items: undefined,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const { width } = useWindowSize();

const route = useRoute();

const emit = defineEmits<{(e: 'update:hide-sidebar', value: string): void;
}>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    proxyHideSidebar: useProxyValue('hideSidebar', props, emit),
    searchValue: '',
    treeList: computed<TreeNode[]>(() => {
        const eventRuleMap: { [key: string]: TreeNode } = props.items.flatMap((item) => item.webhook_id)
            .reduce((acc, cur) => {
                if (cur) {
                    acc[cur] = {
                        id: cur,
                        depth: 0,
                        data: {
                            id: cur,
                            name: cur,
                        },
                        children: [],
                    };
                } else {
                    acc.global = {
                        id: 'global',
                        depth: 0,
                        data: {
                            id: 'global',
                            name: i18n.t('ALERT_MANAGER.EVENT_RULE.GLOBAL'),
                            to: {
                                name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                                params: {
                                    serviceId: storeState.serviceId,
                                },
                                query: {
                                    tab: SERVICE_DETAIL_TABS.SETTINGS,
                                    mode: 'eventRule',
                                    webhookId: 'global',
                                },
                            },
                        },
                        children: [],
                    };
                }
                return acc;
            }, {} as { [key: string]: TreeNode });

        props.items?.forEach((item) => {
            const treeNode: TreeNode = {
                id: item.event_rule_id || '',
                depth: 1,
                data: {
                    id: item.event_rule_id,
                    name: item.name,
                    to: {
                        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                        params: {
                            serviceId: storeState.serviceId,
                        },
                        query: {
                            tab: SERVICE_DETAIL_TABS.SETTINGS,
                            mode: 'eventRule',
                            webhookId: item.webhook_id || 'global',
                            eventRuleId: item.event_rule_id,
                        },
                    },
                },
                children: undefined,
            };

            if (item.webhook_id) {
                if (!eventRuleMap[item.webhook_id]) {
                    eventRuleMap[item.webhook_id] = {
                        id: item.webhook_id,
                        depth: 0,
                        data: {
                            id: item.webhook_id,
                            name: item.webhook_id,
                            to: {
                                name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                                params: {
                                    serviceId: storeState.serviceId,
                                },
                                query: {
                                    tab: SERVICE_DETAIL_TABS.SETTINGS,
                                    mode: 'eventRule',
                                    webhookId: item.webhook_id,
                                    eventRuleId: item.event_rule_id,
                                },
                            },
                        },
                        children: [],
                    };
                }
                eventRuleMap[item.webhook_id].children?.push(treeNode);
            } else {
                eventRuleMap.global.data.to.query.eventRuleId = item.event_rule_id;
                eventRuleMap.global.children?.push(treeNode);
            }
        });

        return Object.values(eventRuleMap);
    }),
    selectedTreeId: undefined as string|undefined,
    treeDisplayMap: {} as TreeDisplayMap,
});

const initSidebar = async () => {
    if (route.query?.eventRuleId) return;
    state.selectedTreeId = props.items[0].event_rule_id;
    const scope = props.items[0].webhook_id || 'global';
    await updateTreeDisplayMap(scope, true);
    await replaceUrlQuery({
        webhookId: scope,
        eventRuleId: state.selectedTreeId,
    });
};
const updateTreeDisplayMap = (id: string, isOpen: boolean) => {
    const displayMap = { ...state.treeDisplayMap };
    displayMap[id] = { isOpen };

    state.treeDisplayMap = displayMap;
};
const handleClickItem = (value: TreeNode) => {
    if (value.depth === 0) {
        updateTreeDisplayMap(value.id, !state.treeDisplayMap[value.id].isOpen);
    } else {
        state.selectedTreeId = value.id;
    }
};
const getWebhookIcon = (id: string): string|undefined => {
    const webhook = storeState.webhook[id].data;
    if (!webhook) return undefined;
    return storeState.plugins[webhook.plugin_info.plugin_id]?.icon || '';
};
const clickResizer = () => {
    state.proxyHideSidebar = !state.proxyHideSidebar;
};
const handleSearchInput = (value: string) => {
    state.searchValue = value;
};

watch([() => storeState.showEventRuleFormCard, () => storeState.isEventRuleEditMode], ([showEventRuleFormCard, isEventRuleEditMode]) => {
    if (!showEventRuleFormCard && !isEventRuleEditMode) {
        initSidebar();
    }
});
watch([() => storeState.eventRuleInfo.event_rule_id, () => route.query?.eventRuleId], ([dataId, routeId]) => {
    state.selectedTreeId = routeId as string;
    if (routeId && dataId) {
        const scope = storeState.eventRuleInfo.webhook_id || 'global';
        updateTreeDisplayMap(scope, true);
    }
}, { immediate: true });
watch(() => props.items, (items) => {
    if (!items.length) return;
    initSidebar();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-side-bar"
         :class="{ 'hidden': state.proxyHideSidebar }"
    >
        <p-pane-layout class="sidebar p-4">
            <div v-if="!state.proxyHideSidebar"
                 class="sidebar-inner flex flex-col gap-4"
            >
                <p class="text-label-md font-bold">
                    {{ $t('ALERT_MANAGER.EVENT_RULE.SIDE_BAR_TITLE') }}
                </p>
                <p-search class="namespace-search"
                          block
                          :value="state.searchValue"
                          @update:value="handleSearchInput"
                />
                <p-tree-view v-if="state.treeList.length > 0"
                             :tree-data="state.treeList"
                             :tree-display-map="state.treeDisplayMap"
                             :selected-id="state.selectedTreeId"
                             @click-item="handleClickItem"
                >
                    <template #content="{ node }">
                        <div class="pt-2 pb-2 text-label-md">
                            <div v-if="node.depth === 0"
                                 class="flex items-center gap-1"
                            >
                                <p-i v-if="node.id === 'global'"
                                     name="ic_globe-filled"
                                     height="1rem"
                                     width="1rem"
                                     color="inherit"
                                />
                                <p-lazy-img v-else
                                            :src="getWebhookIcon(node?.id)"
                                            error-icon="ic_webhook"
                                            width="1rem"
                                            height="1rem"
                                            class="icon"
                                />
                                <span class="text">{{ node.id === 'global' ? $t('ALERT_MANAGER.EVENT_RULE.GLOBAL') : storeState.webhook[node.id].label }}</span>
                            </div>
                            <div v-else>
                                <span class="text">{{ node?.data?.name }}</span>
                            </div>
                        </div>
                    </template>
                </p-tree-view>
                <span v-else
                      class="text-label-md text-gray-500"
                >
                    {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_TITLE') }}
                </span>
            </div>
        </p-pane-layout>
        <div v-if="state.isMobileSize"
             class="resizer"
             @click="clickResizer"
        >
            <p-i width="1.5rem"
                 height="1.5rem"
                 :name="state.proxyHideSidebar ? 'ic_chevron-right' : 'ic_chevron-left'"
                 color="inherit"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-side-bar {
    @apply flex;
    min-height: 23.125rem;
    .sidebar {
        width: 15rem;
        min-height: 23.125rem;
        padding: 0;
        z-index: 1;
        transition: width 0.3s ease;
        .sidebar-inner {
            width: 15rem;
            padding: 1rem;
            transition: width 0.3s ease;
        }
    }
    .resizer {
        @apply flex items-center justify-center bg-white border border-gray-300 cursor-pointer;
        margin-left: -0.25rem;
        margin-top: 0.75rem;
        width: 1.5rem;
        height: 1.5rem;
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
        border-left: none;
        &:hover {
            @apply bg-blue-200;
        }
    }
    &.hidden {
        .sidebar {
            @apply border-r-0;
            width: 0.063rem;
        }
    }
}
</style>
