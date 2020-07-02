import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import {
    computed, ref, Ref, watch,
} from '@vue/composition-api';
import { pushRouterQuery, RouterAPIToolsetInterface } from '@/lib/router-query-string';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { Vue } from 'vue/types/vue';
import { isNotEmpty } from '@/lib/util';

export const tabBarProps = {
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
        },
    },
};

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

export interface TabBarQSNameType {
    select: string;
}

export const makeTabBarQSProps = (names: TabBarQSNameType) => ({
    [names.select]: {
        type: String,
        default: null,
    },
});

export enum DefaultSingleItemTabBarQSPropsName {
    select='st'
}

export enum DefaultMultiItemTabBarQSPropsName {
    select='mt'
}
export const DefaultSingleItemTabBarQSProps = makeTabBarQSProps(DefaultSingleItemTabBarQSPropsName);
export const DefaultMultiItemTabBarQSProps = makeTabBarQSProps(DefaultMultiItemTabBarQSPropsName);


@HelperToolSet()
export class RouterTabBarToolSet<initData, initSyncData> extends TabBarState< initData, initSyncData> implements RouterAPIToolsetInterface<TabBarQSNameType> {
    // eslint-disable-next-line no-empty-function
    routerPush = async () => {}

    applyDisplayRouter =(...args: any[]) => {};


    static initToolSet(_this: RouterTabBarToolSet<any, any>) {
        _this.routerPush = async () => {
            const query = {
                ..._this.vm.$route.query,
                [_this.qsName.select]: _this.syncState.activeTab,
            };
            if (!_this.isShow.value) {
                delete query[_this.qsName.select];
            }
            await pushRouterQuery(query);
        };
        _this.applyDisplayRouter = (props: any) => {
            const selectItems = props[_this.qsName.select];
            if (isNotEmpty(selectItems)) {
                _this.syncState.activeTab = selectItems;
            }
        };
        watch(() => _this.syncState.activeTab, async (aft, bef) => {
            if (aft !== bef) {
                await _this.routerPush();
            }
        });
        watch(_this.isShow, async (aft, bef) => {
            if (aft !== bef) {
                await _this.routerPush();
            }
        }, { lazy: true });
    }


    constructor(
        public vm: Vue|ComponentInstance,
        public qsName: TabBarQSNameType = DefaultSingleItemTabBarQSPropsName,
        public isShow: Ref<boolean> = ref(true),
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(initData, initSyncData);
        RouterTabBarToolSet.initToolSet(this);
    }
}
