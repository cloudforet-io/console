import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import {
    computed, ref, Ref, watch,
} from '@vue/composition-api';

export const isActive = props => name => props.activeTab === name;

export const tabData = props => computed<TabItem[]>(() => props.tabs.map((value: string|TabItem) => {
    if (typeof value === 'string') {
        return { name: value, label: value };
    }
    value.label = value.label || value.name;
    return value;
}));

export const isOne = props => computed(() => props.tabs.length === 1);

export const tabClick = (props, emit) => (name) => {
    if (props.activeTab !== name) {
        emit('update:activeTab', name);
        emit('changeTab', name);
    }
};

export interface TabBarSyncType {
    activeTab: string;
}

export interface TabItem {
    name: string;
    label?: string;
    keepAlive?: boolean;
}

export type TabsType = Array<string|TabItem>;

export interface TabBarStateType {
    tabs: TabsType;
}

export interface TabBarProps extends TabBarStateType, TabBarSyncType {}

@StateToolSet<TabBarStateType>()
@SyncStateToolSet<TabBarSyncType>()
export class TabBarState<
    initData,
    initSyncData,
    initState extends TabBarStateType = TabBarStateType,
    initSync extends TabBarSyncType= TabBarSyncType
    > {
     state: optionalType<initState, initData>

     syncState: optionalType<initSync, initSyncData>;

     // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
     static initState() {
         return {
             tabs: [],
         };
     }

     // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
     static initSyncState() {
         return {
             activeTab: '',
         };
     }

     constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
         this.state = initReactive<optionalType<initState, initData>>(lazy, TabBarState.initState(), initData);
         this.syncState = initReactive<optionalType<initSync, initSyncData>>(lazy, TabBarState.initSyncState(), initSyncData);
     }
}
