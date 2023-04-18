import type { UnwrapRef, ComputedRef } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import type { TabItem } from '@/navigation/tabs/tab/type';


interface TabStateArgs {
    tabs: ComputedRef<Array<string|TabItem>> | Array<string|TabItem>;
    activeTab: ComputedRef<string> | string;
}

interface TabState {
    tabItems: TabItem[];
    keepAliveTabNames: string[];
    nonKeepAliveTabNames: string[];
    currentTabItem?: TabItem;
}

export const useTab = ({ tabs, activeTab }: TabStateArgs) => {
    const state = reactive({
        tabs,
        activeTab,
    });
    const tabState: UnwrapRef<TabState> = reactive({
        tabItems: computed<Required<TabItem>[]>(() => state.tabs.map((tab) => {
            if (typeof tab === 'string') {
                return {
                    name: tab,
                    label: tab,
                    keepAlive: false,
                };
            }
            return {
                name: tab.name,
                label: tab.label ?? tab.name,
                keepAlive: !!tab.keepAlive,
            };
        })),
        keepAliveTabNames: computed<string[]>(() => tabState.tabItems.filter((tabItem) => tabItem.keepAlive).map((tabItem) => tabItem.name)),
        nonKeepAliveTabNames: computed<string[]>(() => tabState.tabItems.filter((tabItem) => !tabItem.keepAlive).map((tabItem) => tabItem.name)),
        currentTabItem: computed<TabItem | undefined>(() => tabState.tabItems.find((tabItem) => tabItem.name === state.activeTab)),
    });

    return {
        ...toRefs(tabState),
    };
};
