import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { DataTablePropsType } from '@/components/organisms/tables/data-table/toolset';

export interface TabBarSyncType {
    activeTab: string;
}

export interface TabItem {
    name: string;
    label?: string;
}

export type TabsType = string[]| TabItem[]

export interface TabBarStateType {
    tabs: TabsType;
}

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
