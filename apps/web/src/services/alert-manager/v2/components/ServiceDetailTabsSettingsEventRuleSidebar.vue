<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';
import draggable from 'vuedraggable';

import { sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PI, PSearch, PBadge, PLazyImg, screens, PButton,
} from '@cloudforet/mirinae';

import type { EventRuleChangeOrderParameters } from '@/schema/alert-manager/event-rule/api-verbs/change-order';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useProxyValue } from '@/common/composables/proxy-state';

import { gray } from '@/styles/colors';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { TreeNode } from '@/services/project/v-shared/tree/type';

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
const { hasReadWriteAccess } = usePageEditableStatus();

const route = useRoute();
const router = useRouter();

const emit = defineEmits<{(e: 'update:hide-sidebar', value: string): void }>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    showEventRuleFormCard: computed<boolean>(() => serviceDetailPageState.showEventRuleFormCard),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});

const state = reactive({
    loading: false,
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    proxyHideSidebar: useProxyValue('hideSidebar', props, emit),
    searchValue: '',
    filteredItems: computed<EventRuleModel[]>(() => {
        const filtered = state.searchValue
            ? props.items.filter((item) => item.name.toLowerCase().includes(state.searchValue.toLowerCase()))
            : props.items;
        return sortBy(filtered, [(item) => !item.webhook_id, 'order']);
    }),
    treeList: [],
    treeListOpenState: {} as Record<string, boolean>,
    selectedTreeId: undefined as string | undefined,
    isEditMode: false,
});

const setTreeList = (): TreeNode[] => {
    const eventRuleMap = state.filteredItems.reduce((acc, item) => {
        const webhookId = item.webhook_id || 'global';

        if (!acc[webhookId]) {
            acc[webhookId] = {
                id: webhookId,
                depth: 0,
                data: {
                    id: webhookId,
                    name: webhookId === 'global' ? i18n.t('ALERT_MANAGER.EVENT_RULE.GLOBAL') : webhookId,
                    to: {
                        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                        query: {
                            tab: SERVICE_DETAIL_TABS.SETTINGS,
                            mode: 'eventRule',
                            webhookId,
                        },
                    },
                },
                isOpen: true,
                children: [],
            };
            state.treeListOpenState[webhookId] = acc[webhookId].isOpen;
        }

        acc[webhookId].children.push({
            id: item.event_rule_id,
            depth: 1,
            data: {
                id: item.event_rule_id,
                name: item.name,
                to: {
                    name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                    query: {
                        tab: SERVICE_DETAIL_TABS.SETTINGS,
                        mode: 'eventRule',
                        webhookId,
                        eventRuleId: item.event_rule_id,
                    },
                },
                order: item.order || 1,
            },
        });

        return acc;
    }, {} as Record<string, TreeNode>);

    return Object.values(eventRuleMap);
};
const initSidebar = async () => {
    if (state.filteredItems.length === 0) return;
    state.selectedTreeId = state.filteredItems[0].event_rule_id;
    const scope = state.filteredItems[0].webhook_id || 'global';
    await replaceUrlQuery({ webhookId: scope, eventRuleId: state.selectedTreeId });
};
const getWebhookIcon = (id: string): string | undefined => {
    const webhook = storeState.webhook[id]?.data;
    return webhook ? storeState.plugins[webhook.plugin_info.plugin_id]?.icon : undefined;
};
const clickResizer = () => {
    state.proxyHideSidebar = !state.proxyHideSidebar;
};

const handleSearchInput = (value: string) => {
    state.searchValue = value;
    state.treeList = setTreeList();
};
const handleClickItem = (value: TreeNode, idx?: number) => {
    if (value.depth === 0 && idx !== undefined) {
        state.treeList[idx].isOpen = !state.treeList[idx].isOpen;
        return;
    }
    if (route.query?.eventRuleId === value.data.to.query?.eventRuleId) return;
    router.push(value.data.to).catch(() => {});
    state.selectedTreeId = value.id;
};
const fetchAndSetEventRuleInfo = async (eventRuleId: string) => {
    if (!eventRuleId) {
        state.selectedTreeId = undefined;
        return;
    }
    await serviceDetailPageStore.fetchEventRuleInfo({ event_rule_id: eventRuleId });
    state.selectedTreeId = storeState.eventRuleInfo.event_rule_id;
};

const handleSaveOrder = async () => {
    state.loading = true;
    try {
        const mismatchedIds = [] as EventRuleChangeOrderParameters[];

        state.treeList.forEach((t) => {
            if (t.children) {
                t.children.forEach((child, index) => {
                    if (child.data.order !== index + 1) {
                        mismatchedIds.push({
                            event_rule_id: child.id,
                            order: index + 1,
                        });
                    }
                });
            }
        });
        await Promise.all(mismatchedIds.map((i) => SpaceConnector.clientV2.alertManager.eventRule.changeOrder<EventRuleChangeOrderParameters>(i)));
        await fetchAndSetEventRuleInfo(route.query?.eventRuleId as string);
        state.isEditMode = false;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = true;
    }
};

watch([() => storeState.isEventRuleEditMode, () => storeState.showEventRuleFormCard], async ([isEditMode, showFormCard]) => {
    if (showFormCard || !isEditMode) return;
    await fetchAndSetEventRuleInfo(route.query?.eventRuleId as string);
}, { immediate: true });

watch(() => route.query?.eventRuleId, async (eventRuleId) => {
    await fetchAndSetEventRuleInfo(eventRuleId as string);
    if (eventRuleId) await serviceDetailPageStore.setShowEventRuleFormCard(false);
}, { immediate: true });

watch([() => props.items.length, () => storeState.showEventRuleFormCard], async ([itemLength, showFormCard]) => {
    if (itemLength === 0) return;
    state.treeList = setTreeList();
    if (!showFormCard && !route.query?.eventRuleId) await initSidebar();
}, { immediate: true });
watch(() => state.isMobileSize, (isMobileSize) => {
    if (!isMobileSize) state.proxyHideSidebar = false;
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-side-bar"
         :class="{ 'hidden': state.proxyHideSidebar && state.isMobileSize, 'mobile-opened': !state.proxyHideSidebar && state.isMobileSize }"
    >
        <p-pane-layout class="sidebar p-4">
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
            <div v-if="!state.proxyHideSidebar"
                 class="sidebar-inner flex flex-col text-label-md gap-4"
            >
                <div class="flex items-center justify-between">
                    <p class="font-bold">
                        {{ $t('ALERT_MANAGER.EVENT_RULE.SIDE_BAR_TITLE') }}
                    </p>
                    <template v-if="hasReadWriteAccess">
                        <p-button v-if="!state.isEditMode"
                                  size="sm"
                                  style-type="tertiary"
                                  @click="state.isEditMode = true"
                        >
                            {{ $t('ALERT_MANAGER.EVENT_RULE.SET_ORDER') }}
                        </p-button>
                        <p-button v-else
                                  size="sm"
                                  @click="handleSaveOrder"
                        >
                            {{ $t('ALERT_MANAGER.EVENT_RULE.SAVE') }}
                        </p-button>
                    </template>
                </div>
                <p-search class="namespace-search"
                          block
                          :value="state.searchValue"
                          @update:value="handleSearchInput"
                />
                <div v-if="state.treeList.length > 0">
                    <div v-for="(title, idx) in state.treeList"
                         :key="`title-${idx}`"
                         class="cursor-pointer"
                         @click="handleClickItem(title, idx)"
                    >
                        <div class="tree-item">
                            <p-i name="ic_chevron-down"
                                 width="1.25rem"
                                 height="1.25rem"
                                 :color="gray[900]"
                                 class="arrow-button"
                                 :class="{'is-collapsed': !title.isOpen}"
                            />
                            <p-i v-if="title.id === 'global'"
                                 name="ic_globe-filled"
                                 height="1rem"
                                 width="1rem"
                                 color="inherit"
                            />
                            <p-lazy-img v-else
                                        :src="getWebhookIcon(title?.id)"
                                        error-icon="ic_webhook"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="ml-1">{{ title.id === 'global' ? $t('ALERT_MANAGER.EVENT_RULE.GLOBAL') : storeState.webhook[title.id]?.label }}</span>
                        </div>
                        <draggable v-if="title.isOpen"
                                   v-model="title.children"
                                   ghost-class="ghost"
                                   handle=".handle"
                                   draggable=".children-item"
                        >
                            <div v-for="(item, itemIdx) in title.children || []"
                                 :key="`children-${itemIdx}`"
                                 class="tree-item children-item"
                                 :class="{ 'is-selected': state.selectedTreeId === item.id }"
                                 @click.stop="handleClickItem(item)"
                            >
                                <div class="flex items-center gap-1 pl-8 w-full">
                                    <p-badge style-type="gray500"
                                             badge-type="solid-outline"
                                    >
                                        {{ itemIdx + 1 }}
                                    </p-badge>
                                    <span class="truncate max-w-36">{{ item.data.name }}</span>
                                    <p-i v-if="state.isEditMode"
                                         name="ic_drag-handle"
                                         width="1rem"
                                         height="1rem"
                                         class="handle"
                                         :color="gray[500]"
                                    />
                                </div>
                            </div>
                        </draggable>
                    </div>
                </div>
                <span v-else
                      class="text-label-md text-gray-500"
                >
                    {{ $t('ALERT_MANAGER.EVENT_RULE.NO_DATA_TITLE') }}
                </span>
            </div>
        </p-pane-layout>
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
        z-index: 2;
        transition: width 0.3s ease;
        .sidebar-inner {
            width: 15rem;
            padding: 1rem;
            transition: width 0.3s ease;
            .tree-item {
                @apply flex items-center pt-1.5 pr-0.5 pb-1.5;
                .arrow-button {
                    &.is-collapsed {
                        transform: rotate(-90deg);
                    }
                }
                &.is-selected {
                    @apply bg-blue-200;
                    border-radius: 0.25rem;
                }
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
            z-index: 1;
            &:hover {
                @apply bg-blue-200;
            }
        }
    }
    &.hidden {
        position: absolute;
        top: 23.5px;
        left: -1.5rem;
        z-index: 1000;
        .sidebar {
            @apply border-r-0;
            width: 0;
        }
    }
    &.mobile-opened {
        position: absolute;
        top: 23.5px;
        left: -1.5rem;
        z-index: 1000;
        .resizer {
            margin-left: 14.9rem;
        }
    }
}
</style>
