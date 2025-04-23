<script setup lang="ts">
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import { onClickOutside, useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash';

import PTextButton from '@/controls/buttons/text-button/PTextButton.vue';
import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/controls/context-menu/type';
import PI from '@/foundation/icons/PI.vue';
import { useTab } from '@/hooks/use-tab/use-tab';
import PDivider from '@/layouts/divider/PDivider.vue';
import FolderTab from '@/navigation/tabs/tab/components/FolderTab.vue';
import type { TabItem } from '@/navigation/tabs/tab/type';

const CUSTOM_BACK_BUTTON = 'CUSTOM_BACK_BUTTON';
interface Props {
    activeTab: string;
    tabs: string[] | TabItem[];
    stretch?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:active-tab', value: string): void;
    (e: 'change', value: string, idx: number): void;
}>();

const tabContainerRef = ref<HTMLElement|null>(null);
const tabItemsRef = ref<(HTMLElement|typeof PDivider|typeof FolderTab)[]>([]);
const slotRef = ref<HTMLElement|null>(null);
const hiddenTabsMenuRef = ref<HTMLElement|null>(null);

const {
    tabItems,
    keepAliveTabNames,
    nonKeepAliveTabNames,
    currentTabItem,
} = useTab({
    tabs: computed(() => props.tabs),
    activeTab: computed(() => props.activeTab),
});

const state = reactive({
    selectedFolderTab: undefined as string|undefined,
    selectedContextMenuItem: computed<MenuItem|undefined>(() => {
        if (!props.tabs.length) return undefined;
        if (typeof props.tabs[0] === 'string') return undefined;
        const flattenTabs = props.tabs.reduce((acc, tab) => {
            if (typeof tab !== 'string' && tab?.tabType === 'folder') {
                acc.push(...((tab as TabItem)?.subItems as TabItem[] ?? []));
            } else {
                acc.push(tab as TabItem);
            }
            return acc;
        }, [] as TabItem[]);
        return {
            name: props.activeTab,
            label: flattenTabs.find((tab) => tab.name === props.activeTab)?.label || props.activeTab,
        };
    }),
    visibleTabItems: [] as TabItem[],
    hiddenTabItems: [] as TabItem[],
    firstRenderDone: false,
    hiddenTabsVisible: false,
    selectedHiddenParentTab: undefined as string|undefined,
    hiddenTabMenuItems: computed<MenuItem[]>(() => {
        if (state.selectedHiddenParentTab) {
            const selectedTab = state.hiddenTabItems.find((tab) => tab.name === state.selectedHiddenParentTab);
            return [
                {
                    name: CUSTOM_BACK_BUTTON, // Custom Menu Item for back button
                    icon: 'ic_arrow-left',
                    iconColor: '#0062B8',
                },
                {
                    type: 'divider',
                },
                ...selectedTab?.subItems || [],
            ];
        }
        return state.hiddenTabItems;
    }),
});


/* Events */
const handleSelectTab = (tab: TabItem, idx: number) => {
    selectTab(tab, idx);
    hideGroupTab();
};
const handleSelectGroupTab = (tab: TabItem) => {
    if (state.selectedFolderTab === tab.name) {
        hideGroupTab();
    } else {
        state.selectedFolderTab = tab.name;
    }
};
const handleSelectGroupTabMenu = (item: MenuItem, idx?: number) => {
    if (idx !== undefined) {
        selectTab(item as unknown as TabItem, idx);
        hideGroupTab();
    }
};
const handleClickHiddenTabsMenu = () => {
    state.selectedHiddenParentTab = undefined;
    if (state.hiddenTabsVisible) {
        state.hiddenTabsVisible = false;
    } else {
        state.hiddenTabsVisible = true;
    }
};
const handleSelectHiddenTab = (tab: TabItem, idx: number) => {
    if (tab.subItems) {
        state.selectedHiddenParentTab = tab.name;
    } else if (tab.name === CUSTOM_BACK_BUTTON) {
        state.selectedHiddenParentTab = undefined;
    } else {
        selectTab(tab, idx);
        state.hiddenTabsVisible = false;
    }
};


/* Utils */
const hideHiddenTabs = () => {
    state.hiddenTabsVisible = false;
};
const selectTab = (tab: TabItem, idx: number) => {
    if (props.activeTab !== tab.name) {
        emit('update:active-tab', tab.name);
        emit('change', tab.name, idx);
    }
};

const hideGroupTab = () => {
    state.selectedFolderTab = undefined;
};

// Calculate the width of the tabs and hide the tabs that do not fit in the container
const calculateWidths = () => {
    const ulWidth = (tabContainerRef?.value?.offsetWidth || 0) - (slotRef?.value?.clientWidth || 0) - 16;
    let totalWidth = 0;
    let lastValidTotalWidth = 0;
    let i = 0;
    let lastValidIndex = -1;
    let lastTabWidth = 0;

    while (i < tabItemsRef.value.length && totalWidth <= ulWidth) {
        const item = tabItemsRef.value[i];
        const itemWidth = item.clientWidth || ((item as typeof PDivider).$el.clientWidth + 16) || 0;

        totalWidth += itemWidth;
        lastValidTotalWidth += itemWidth;
        lastTabWidth = itemWidth;

        if (totalWidth <= ulWidth) {
            lastValidIndex = i;
        }

        i++;
    }

    if (lastValidTotalWidth - lastTabWidth > ulWidth - 36 && lastValidIndex > 0) {
        lastValidIndex--;
    }

    const visibleTabs = tabItems.value.slice(0, lastValidIndex + 1);
    const hiddenTabs = tabItems.value.slice(lastValidIndex + 1);
    state.visibleTabItems = visibleTabs;
    state.hiddenTabItems = hiddenTabs.filter((tab) => tab.tabType !== 'divider');
    state.firstRenderDone = true; // This is to prevent the tabs from being hidden on the first render
};

// Calculate the widths of the tabs when tab size is changed
useResizeObserver(tabContainerRef, throttle(() => {
    state.firstRenderDone = false;
    nextTick(() => {
        calculateWidths();
    });
}, 500));

// Calculate the widths of the tabs when the tabs are updated
watch(() => props.tabs, () => {
    state.firstRenderDone = false;
    nextTick(() => {
        calculateWidths();
    });
});

onClickOutside(hiddenTabsMenuRef, hideHiddenTabs);

</script>

<template>
    <div ref="tabContainerRef"
         class="p-tab"
    >
        <div class="tab-header">
            <ul class="tab-item-wrapper"
                :class="{stretch}"
            >
                <template v-for="(tab, idx) in state.firstRenderDone ? state.visibleTabItems : tabItems">
                    <p-divider v-if="tab.tabType === 'divider'"
                               :key="tab.name"
                               ref="tabItemsRef"
                               class="divider-item"
                               vertical
                    />
                    <folder-tab v-else-if="tab.tabType === 'folder'"
                                :key="tab.name"
                                ref="tabItemsRef"
                                :tab="tab"
                                :active-tab="props.activeTab"
                                :selected-folder-tab="state.selectedFolderTab"
                                :selected-context-menu-item="state.selectedContextMenuItem"
                                :visible-sub-menu="state.selectedFolderTab === tab.name"
                                @select-tab="handleSelectGroupTab(tab)"
                                @select-tab-menu="handleSelectGroupTabMenu"
                    />
                    <li v-else
                        :key="tab.name"
                        ref="tabItemsRef"
                        :class="{active: activeTab === tab.name}"
                        role="tab"
                        :tabindex="0"
                        @keydown.enter="handleSelectTab(tab, idx)"
                        @click="handleSelectTab(tab, idx)"
                    >
                        <div class="content-wrapper">
                            <p-i v-if="tab.icon"
                                 class="tab-icon"
                                 :name="tab.icon"
                                 color="inherit"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <span class="label">
                                {{ tab.label }}
                            </span>
                            <span class="extra">
                                <slot name="extra"
                                      v-bind="tab"
                                />
                            </span>
                        </div>
                    </li>
                </template>
            </ul>
            <div class="right-contents">
                <ul v-if="state.hiddenTabItems?.length"
                    class="tab-item-wrapper"
                >
                    <li key="hidden-tabs"
                        ref="hiddenTabsMenuRef"
                        :class="{active: state.hiddenTabItems.some((item) => activeTab === item.name || item.subItems?.some((subItem) => activeTab === subItem.name) )}"
                        role="tab"
                        @keydown.enter="handleClickHiddenTabsMenu"
                        @click="handleClickHiddenTabsMenu"
                    >
                        <div class="content-wrapper">
                            <p-i class="hidden-tabs-icon"
                                 :name="state.hiddenTabsVisible ? 'ic_chevron-up' : 'ic_chevron-down'"
                                 width="1.25rem"
                                 height="1.25rem"
                                 :color="state.hiddenTabsVisible ? '#232533' : 'inherit'"
                            />
                        </div>
                        <p-context-menu v-if="state.hiddenTabsVisible"
                                        class="hidden-tabs-menu"
                                        :menu="state.hiddenTabMenuItems"
                                        :selected="state.selectedContextMenuItem ? [state.selectedContextMenuItem]: undefined"
                                        @select="handleSelectHiddenTab"
                        >
                            <template #item--format="{ item }">
                                <p-text-button v-if="item?.name === CUSTOM_BACK_BUTTON"
                                               style-type="highlight"
                                >
                                    {{ $t('COMPONENT.TAB.BACK') }}
                                </p-text-button>
                                <template v-else>
                                    {{ item?.label || item?.name }}
                                </template>
                            </template>
                            <template v-if="state.selectedHiddenParentTab && state.hiddenTabMenuItems.length === 2"
                                      #bottom
                            >
                                <div class="empty-sub-menu-item">
                                    {{ $t('COMPONENT.CONTEXT_MENU.NO_ITEM') }}
                                </div>
                            </template>
                        </p-context-menu>
                    </li>
                </ul>
                <div ref="slotRef">
                    <slot name="header-right-contents" />
                </div>
            </div>
        </div>
        <div class="tab-pane">
            <slot v-bind="currentTabItem" />
            <keep-alive>
                <slot v-if="keepAliveTabNames.includes(activeTab)"
                      :name="activeTab"
                      v-bind="currentTabItem"
                />
            </keep-alive>
            <slot v-if="nonKeepAliveTabNames.includes(activeTab)"
                  :name="activeTab"
                  v-bind="currentTabItem"
            />
        </div>
        <div class="footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<style lang="postcss">
.p-tab {
    @apply rounded-lg border border-gray-200 bg-white;
    min-height: 19rem;
    display: flex;
    flex-direction: column;

    .tab-header {
        @apply flex justify-between items-center border-b border-gray-100;
        padding: 0 0.5rem;

        .right-contents {
            @apply flex items-center;
        }
    }

    ul.tab-item-wrapper {
        @apply border-gray-100 flex flex-wrap items-center;
        width: 100%;
        flex: 1;
        li {
            @apply relative text-gray-600 cursor-pointer;
            height: 2.5rem;
            min-height: 2.5rem;
            max-width: 10rem;
            border-bottom-width: 0.1875rem;
            text-decoration: none;
            text-align: center;
            margin-bottom: -1px;
            border-color: transparent;
            box-sizing: border-box;
            padding: 0 0.5rem;

            @media (hover: hover) {
                &:hover {
                    @apply text-gray-900 bg-gray-100;
                }
            }
            &.active {
                @apply text-primary border-primary;
            }
            .content-wrapper {
                @apply flex items-center justify-center w-full h-full;
                .tab-icon {
                    min-width: 0.875rem;
                    margin-right: 0.25rem;
                }
                .label {
                    @apply w-full text-label-md block truncate;
                }
                .extra {
                    margin-left: 0.25rem;
                }
                .sub-item-dropdown-icon {
                    min-width: 1.25rem;
                    margin-left: 0.25rem;
                }
                .hidden-tabs-icon {
                    min-width: 1.25rem;
                }
            }
            .sub-item-menu {
                position: absolute;
                top: 100%;
                left: 0;
                z-index: 100;
                width: max-content;
            }
            .hidden-tabs-menu {
                position: absolute;
                top: 100%;
                right: 0;
                z-index: 100;
                width: max-content;
            }
        }
        .divider-item {
            height: 1rem;
            margin: 0 0.5rem;
        }
        &.stretch {
            flex-wrap: nowrap;
            justify-content: space-around;
            li {
                flex-grow: 1;
                flex-shrink: 0;
            }
            .label {
                display: inline-flex;
                justify-content: center;
            }
        }
    }

    .tab-pane {
        @apply w-full pb-8;
        flex: 1 1;
    }
    .footer {
        flex: 0 0;
    }
}

.empty-sub-menu-item {
    @apply text-label-md text-gray-300;
}
</style>
