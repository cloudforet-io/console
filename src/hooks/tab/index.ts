import { computed, reactive, SetupContext } from '@vue/composition-api';
import { TabItem } from '@/navigation/tabs/tab/type';

export interface TabItemProps {
    tabs: string|TabItem;
    activeTab: string;
}

const getTabState = (props, { slots }: SetupContext) => {
    const state = reactive({
        tabItems: computed<Required<TabItem>[]>(() => props.tabs.map((value: string|TabItem) => {
            if (typeof value === 'string') {
                return { name: value, label: value, keepAlive: false };
            }
            if (!value.label) value.label = value.name;
            if (!value.keepAlive) value.keepAlive = false;
            return value;
        })),
        nonKeepTabNames: computed<string[]>(() => state.tabItems.filter(tab => !tab.keepAlive).map(tab => tab.name)),
        keepTabNames: computed<string[]>(() => state.tabItems.filter(tab => tab.keepAlive).map(tab => tab.name)),
        currentTabItem: computed(() => state.tabItems.find(tab => tab.name === props.activeTab)),
    });
    return state;
};

export const useTab = (props, context: SetupContext) => {
    const state = getTabState(props, context);

    const onClickTab = ({ name }: TabItem) => {
        if (props.activeTab !== name) context.emit('update:activeTab', name);
    };

    return { state, onClickTab };
};
