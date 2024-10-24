import type { ComputedRef, Ref } from 'vue';

import type { TranslateResult } from 'vue-i18n';

/* Generic type T represents the additional properties that can be added to the tab item. */
export type TabItem<T extends object> = {
    /* name: The identifier for the tab. */
    name: string;
    /* label: The display label for the tab. This supports localized string or other message formats. */
    label?: TranslateResult;
    /* keepAlive: A flag indicating if the tab should be preserved when switching to other tabs. */
    keepAlive?: boolean;
    /* subItems: An array containing nested `TabItem` elements for hierarchical tab structures. */
    subItems?: Array<string|TabItem<T>>;
} & T;

export interface UseTabOptions<T extends object> {
    /* tabs: An array containing tab information. Each tab can be a `string` or an object that follows the `TabItem` structure. */
    tabs: Ref<Array<string|TabItem<T>>> | Array<string|TabItem<T>>;
    /* activeTab: Represents the currently active tab. */
    activeTab: Ref<string> | string;
    /* defaultItem: An object that provides default properties for all generated tabs.
    This ensures consistency across tab items when only partial information is provided. */
    defaultItem?: T;
}

export interface UseTabReturns<T extends object> {
    /* tabItems: An array containing the resolved tab items based on the `tabs` input and the optional `defaultItem`. It provides a processed list of tabs with consistent structure. */
    tabItems: ComputedRef<TabItem<T>[]>;
    /* keepAliveTabNames: An array listing the names of tabs marked to be kept alive (`keepAlive: true`.) */
    keepAliveTabNames: ComputedRef<string[]>;
    /* nonKeepAliveTabNames: An array listing the names of tabs not set to be kept alive. */
    nonKeepAliveTabNames: ComputedRef<string[]>;
    /* currentTabItem: Represents the currently active tab item based on the `activeTab` input. If no matching tab is found, it returns `undefined`. */
    currentTabItem: ComputedRef<TabItem<T>|undefined>;
}
