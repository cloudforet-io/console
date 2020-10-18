import { ThemeType } from '@/components/molecules/selectable-item/type';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { computed, reactive, Ref } from '@vue/composition-api';

export const selectableListProps = {
    items: {
        type: Array,
        default: () => [],
    },
    /* sync */
    selectedIndexes: {
        type: Array,
        default: () => [],
    },
    /* sync */
    disabledIndexes: {
        type: Array,
        default: () => [],
    },
    mapper: {
        type: Object,
        required: true,
    },
    multiSelectable: {
        type: Boolean,
        default: true,
    },
    mustSelect: {
        type: Boolean,
        default: true,
    },
    defaultIcon: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    theme: {
        type: String,
        default: 'default',
        validator(theme) {
            return ['default', 'card'].includes(theme);
        },
    },
};
export type MapperKeyType = string | ((key: string) => string);
interface MapperType {
    key: MapperKeyType;
    iconUrl: MapperKeyType;
    title: MapperKeyType;
    color: MapperKeyType;
}

interface SelectableListType<item=any> {
    items: item[];
    mapper: MapperType;
    multiSelectable?: boolean;
    mustSelect?: boolean;
    defaultIcon?: string;
    loading?: boolean;
    theme: ThemeType;
}

interface SelectableListSyncType {
    selectedIndexes: number[];
    disabledIndexes: number[];
}
export interface SelectableListPropsType extends SelectableListType, SelectableListSyncType {}

@StateToolSet<SelectableListType>()
@SyncStateToolSet<SelectableListSyncType>()
export class SelectableListState<
    initData,
    initSyncData,
    item=any,
    initState extends SelectableListType = SelectableListType<item>,
    initSync extends SelectableListSyncType= SelectableListSyncType
    > {
    state: optionalType<initState, initData>

    syncState: optionalType<initSync, initSyncData>;

    static initState(): SelectableListType {
        return {
            items: [],
            mapper: {
                key: '',
                iconUrl: '',
                title: '',
                color: '',
            },
            multiSelectable: false,
            mustSelect: true,
            defaultIcon: '',
            loading: false,
            theme: 'default',
        };
    }

    static initSyncState() {
        return {
            selectedIndexes: [],
            disabledIndexes: [],
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        this.state = initReactive<optionalType<initState, initData>>(lazy, SelectableListState.initState(), initData);
        this.syncState = initReactive<optionalType<initSync, initSyncData>>(lazy, SelectableListState.initSyncState(), initSyncData);
    }
}
export interface SelectableListSelectState<item=any> {
    isNotSelected: boolean;
    isSelectOne: boolean;
    isSelectMulti: boolean;
    selectItems: readonly item[];
    firstSelectItem: item;
}

const initSelectState = function <item=any> (state: SelectableListType, syncState: SelectableListSyncType): SelectableListSelectState {
    const isNotSelected: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length === 0 : true));
    const isSelectOne: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length === 1 : false));
    const isSelectMulti: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length > 1 : false));
    const selectItems: Ref<readonly item[]> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).map(idx => (state.items as Array<item>)[idx]) : []));
    const firstSelectItem: Ref<item> = computed(() => (!isNotSelected.value ? (state.items as Array<item>)[(syncState.selectedIndexes as number[])[0]] : {} as item));
    return reactive({
        isNotSelected,
        isSelectOne,
        isSelectMulti,
        selectItems,
        firstSelectItem,
    });
};

@HelperToolSet()
export class SelectableListToolset<initData, initSyncData, item=any> extends SelectableListState<initData, initSyncData, item> {
    selectState: SelectableListSelectState<item>= null as unknown as SelectableListSelectState;

    static initToolSet(_this: any) {
        _this.selectState = initSelectState(_this.state, _this.syncState);
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        SelectableListToolset.initToolSet(this);
    }
}
