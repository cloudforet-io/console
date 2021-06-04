import {
    computed, reactive, SetupContext,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';

export interface TabItem {
    name: string;
    label?: string | TranslateResult;
    keepAlive?: boolean;
}

export interface TabProps {
    activeTab: string;
    tabs: Array<string|TabItem>;
    keepAliveAll?: boolean;
}

const getTabState = (props: TabProps) => {
    const state = reactive({
        tabItems: computed<Required<TabItem>[]>(() => props.tabs.map((value) => {
            if (typeof value === 'string') {
                return { name: value, label: value, keepAlive: false };
            }
            return { name: value.name, label: value.label ?? value.name, keepAlive: !!value.keepAlive };
        })),
        nonKeepTabNames: computed<string[]>(() => {
            if (props.keepAliveAll) return [];
            return state.tabItems.filter(tab => !tab.keepAlive).map(tab => tab.name);
        }),
        keepTabNames: computed<string[]>(() => {
            const tabs = props.keepAliveAll ? state.tabItems : state.tabItems.filter(tab => tab.keepAlive);
            return tabs.map(tab => tab.name);
        }),
        currentTabItem: computed<Required<TabItem>|undefined>(() => state.tabItems.find(tab => tab.name === state.proxyActiveTab)),
    });
    return state;
};

export const useTab = (props: TabProps, context: SetupContext) => {
    const state = getTabState(props);

    const onClickTab = (tab: TabItem, idx: number) => {
        if (state.proxyActiveTab !== tab.name) {
            context.emit('update:activeTab', tab.name);
            context.emit('change', tab.name, idx);
        }
    };

    return { state, onClickTab };
};
