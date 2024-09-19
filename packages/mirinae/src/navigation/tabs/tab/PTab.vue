<template>
    <div ref="tabContainerRef"
         class="p-tab"
    >
        <div class="tab-header">
            <ul class="tab-item-wrapper"
                :class="{stretch}"
            >
                <template v-for="(tab, idx) in firstRenderDone ? visibleTabItems : tabItems">
                    <p-divider v-if="tab.type === 'divider'"
                               :key="tab.name"
                               ref="tabItemsRef"
                               class="divider-item"
                               vertical
                    />
                    <li v-else-if="tab.type === 'folder'"
                        :key="tab.name"
                        ref="tabItemsRef"
                        :class="{active: tab.subItems?.some((subItem) => activeTab === subItem.name)}"
                        role="tab"
                        @keydown.enter="handleSelectGroupTab(tab)"
                        @click="handleSelectGroupTab(tab)"
                    >
                        <div class="content-wrapper">
                            <span class="label">
                                {{ tab.label }}
                            </span>
                            <p-i class="sub-item-dropdown-icon"
                                 name="ic_chevron-down"
                                 width="1.25rem"
                                 height="1.25rem"
                                 color="inherit"
                            />
                        </div>
                        <p-context-menu v-if="selectedFolderTab === tab.name"
                                        ref="groupTabMenuRef"
                                        class="sub-item-menu"
                                        :menu="tab?.subItems ?? []"
                                        :selected="selectedContextMenuItem ? [selectedContextMenuItem]: undefined"
                                        @select="handleSelectGroupTabMenu"
                        />
                    </li>
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
                <ul v-if="hiddenTabItems?.length"
                    class="tab-item-wrapper"
                >
                    <li key="hidden-tabs"
                        :class="{active: hiddenTabItems.some((item) => activeTab === item.name || item.subItems?.some((subItem) => activeTab === subItem.name) )}"
                        role="tab"
                        @keydown.enter="handleClickHiddenTabsMenu"
                        @click="handleClickHiddenTabsMenu"
                    >
                        <div class="content-wrapper">
                            <p-i class="hidden-tabs-icon"
                                 name="ic_chevron-down"
                                 width="1.25rem"
                                 height="1.25rem"
                                 color="inherit"
                            />
                        </div>
                        <p-context-menu v-if="hiddenTabsVisible"
                                        ref="hiddenTabsMenuRef"
                                        class="hidden-tabs-menu"
                                        :menu="hiddenTabMenuItems"
                                        :selected="selectedContextMenuItem ? [selectedContextMenuItem]: undefined"
                                        @select="handleSelectHiddenTab"
                        >
                            <template #item--format="{ item }">
                                <p-text-button v-if="item?.name === 'CUSTOM_BACK_BUTTON'"
                                               style-type="highlight"
                                >
                                    {{ $t('Back') }}
                                </p-text-button>
                                <template v-else>
                                    {{ item?.label || item?.name }}
                                </template>
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
            <slot />
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

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, nextTick, reactive, ref, toRefs,
} from 'vue';

import { onClickOutside, useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash';

import PI from '@/foundation/icons/PI.vue';
import { useTab } from '@/hooks/tab';
import PTextButton from '@/inputs/buttons/text-button/PTextButton.vue';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import PDivider from '@/layouts/divider/PDivider.vue';
import type { TabItem, TabProps } from '@/navigation/tabs/tab/type';

export default defineComponent<TabProps>({
    name: 'PTab',
    components: {
        PTextButton, PContextMenu, PDivider, PI,
    },
    model: {
        prop: 'activeTab',
        event: 'update:activeTab',
    },
    props: {
        /* tab item props */
        tabs: {
            type: Array as PropType<Array<string|TabItem>>,
            default: () => [],
        },
        activeTab: {
            type: String,
            required: true,
        },
        /* tab props */
        stretch: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const tabContainerRef = ref<HTMLElement|null>(null);
        const tabItemsRef = ref<(HTMLElement|typeof PDivider)[]>([]);
        const slotRef = ref<HTMLElement|null>(null);
        const groupTabMenuRef = ref<HTMLElement|null>(null);
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
                    if (tab?.type === 'folder') {
                        acc.push(...(tab?.subItems ?? []));
                    } else {
                        acc.push(tab);
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
                            name: 'CUSTOM_BACK_BUTTON', // Custom Menu Item for back button
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
        const handleSelectGroupTabMenu = (tab: TabItem, idx: number) => {
            selectTab(tab, idx);
            hideGroupTab();
        };
        const handleClickHiddenTabsMenu = () => {
            state.selectedHiddenParentTab = undefined;
            state.hiddenTabsVisible = !state.hiddenTabsVisible;
        };
        const handleSelectHiddenTab = (tab: TabItem, idx: number) => {
            if (tab.subItems) {
                state.selectedHiddenParentTab = tab.name;
            } else if (tab.name === 'CUSTOM_BACK_BUTTON') {
                state.selectedHiddenParentTab = undefined;
            } else {
                selectTab(tab, idx);
                state.hiddenTabsVisible = false;
            }
        };


        /* Utils */
        const selectTab = (tab: TabItem, idx: number) => {
            if (props.activeTab !== tab.name) {
                emit('update:activeTab', tab.name);
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
                const itemWidth = item.clientWidth || (item.$el.clientWidth + 16) || 0;

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
            state.hiddenTabItems = hiddenTabs.filter((tab) => tab.type !== 'divider');
            state.firstRenderDone = true; // This is to prevent the tabs from being hidden on the first render
        };
        useResizeObserver(tabContainerRef, throttle(() => {
            state.firstRenderDone = false;
            nextTick(() => {
                calculateWidths();
            });
        }, 500));

        onClickOutside(hiddenTabsMenuRef, () => { state.hiddenTabsVisible = false; });

        return {
            tabContainerRef,
            tabItemsRef,
            slotRef,
            groupTabMenuRef,
            hiddenTabsMenuRef,
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
            handleSelectTab,
            handleSelectGroupTab,
            handleSelectGroupTabMenu,
            handleSelectHiddenTab,
            handleClickHiddenTabsMenu,
            ...toRefs(state),
        };
    },
});
</script>

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
            @apply relative text-gray-400 cursor-pointer;
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
                    @apply text-gray-900;
                }
            }
            &.active {
                @apply text-primary border-primary;
            }
            .content-wrapper {
                @apply flex items-center justify-center w-full h-full;
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
            }
            .hidden-tabs-menu {
                position: absolute;
                top: 100%;
                right: 0;
                z-index: 100;
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
</style>
