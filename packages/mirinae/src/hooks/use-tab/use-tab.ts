import type { ComputedRef, Ref } from 'vue';
import {
    computed, reactive,
} from 'vue';

import type { TranslateResult } from 'vue-i18n';

export type TabItem<T extends object> = {
    name: string;
    label?: TranslateResult; // includes string
    keepAlive?: boolean;
    subItems?: Array<string|TabItem<T>>;
} & T;

export interface UseTabOptions<T extends object = Record<string, never>> {
    tabs: Ref<Array<string|TabItem<T>>> | Array<string|TabItem<T>>;
    activeTab: Ref<string> | string;
    defaultItem?: T;
}

interface UseTabReturns<T extends object> {
    tabItems: ComputedRef<TabItem<T>[]>;
    keepAliveTabNames: ComputedRef<string[]>;
    nonKeepAliveTabNames: ComputedRef<string[]>;
    currentTabItem: ComputedRef<TabItem<T>|undefined>;
}
const generateTabItem = <T extends object>(tab: string|TabItem<T>, defaultItem: T = {} as T): TabItem<T> => {
    if (typeof tab === 'string') {
        return {
            ...defaultItem,
            name: tab,
            label: tab,
        };
    }
    return {
        ...defaultItem,
        ...tab,
        name: tab.name,
        label: tab.label ?? tab.name,
        keepAlive: !!tab.keepAlive,
        subItems: tab.subItems?.map((subItem) => generateTabItem<T>(subItem, defaultItem)),
    };
};
export const useTab = <T extends object = object>({ tabs, activeTab, defaultItem }: UseTabOptions<T>): UseTabReturns<T> => {
    const state = reactive({
        tabs,
        activeTab,
    });
    const tabItems = computed<TabItem<T>[]>(() => state.tabs.map((tab) => generateTabItem<T>(tab, defaultItem)));

    return {
        tabItems,
        keepAliveTabNames: computed<string[]>(() => tabItems.value.filter((tabItem) => tabItem.keepAlive).map((tabItem) => tabItem.name)),
        nonKeepAliveTabNames: computed<string[]>(() => tabItems.value.filter((tabItem) => !tabItem.keepAlive).map((tabItem) => tabItem.name)),
        currentTabItem: computed<TabItem<T> | undefined>(() => tabItems.value.find((tabItem) => tabItem.name === state.activeTab)),
    };
};
