import { SelectableItemPropsType } from '@/components/molecules/selectable-item/SelectableItem.toolset';
import {HelperToolSet, initReactive, optionalType, StateToolSet, SyncStateToolSet} from "@/lib/toolset";
import {computed, reactive, Ref} from "@vue/composition-api";

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
};

interface MapperType {
    key: string;
    iconUrl: string;
    title: string;
}

interface SelectableListType {
    items: SelectableItemPropsType[];
    mapper: MapperType;
    multiSelectable?: boolean;
    mustSelect?: boolean;
    defaultIcon?: string;
    loading?: boolean;
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
    initState extends SelectableListType = SelectableListType,
    initSync extends SelectableListSyncType= SelectableListSyncType
    > {
    state:optionalType<initState, initData>
    syncState: optionalType<initSync, initSyncData>;

    static initState() {
        return {
            items:[],
            mapper: {
                key:'',
                iconUrl:'',
                title: '',
            },
            multiSelectable: false,
            mustSelect:true,
            defaultIcon:'',
            loading: false
        }
    }

    static initSyncState() {
        return {
            selectedIndexes:[],
            disabledIndexes:[],
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        this.state = initReactive<optionalType<initState, initData>>(lazy, SelectableListState.initState(), initData);
        this.syncState = initReactive<optionalType<initSync, initSyncData>>(lazy, SelectableListState.initSyncState(), initSyncData);
    }
}
export interface SelectableListSelectState {
    isNotSelected: boolean;
    isSelectOne: boolean;
    isSelectMulti: boolean;
    selectItems: readonly any[];
    firstSelectItem: any;
}

const initSelectState = (state: SelectableListType, syncState: SelectableListSyncType): SelectableListSelectState => {
    const isNotSelected: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length === 0 : true));
    const isSelectOne: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length === 1 : false));
    const isSelectMulti: Ref<boolean> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).length > 1 : false));
    const selectItems: Ref<readonly any[]> = computed(() => (syncState.selectedIndexes ? (syncState.selectedIndexes as Array<any>).map(idx => (state.items as Array<any>)[idx]) : []));
    const firstSelectItem: Ref<any> = computed(() => (!isNotSelected.value ? (state.items as Array<any>)[(syncState.selectedIndexes as number[])[0]] : {}));
    return reactive({
        isNotSelected,
        isSelectOne,
        isSelectMulti,
        selectItems,
        firstSelectItem,
    });
};

@HelperToolSet()
export class SelectableListToolset<initData, initSyncData> extends SelectableListState<initData, initSyncData> {
    selectState: SelectableListSelectState= null as unknown as SelectableListSelectState;

    static initToolSet(_this: any) {
        _this.selectState = initSelectState(_this.state, _this.syncState);
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        SelectableListToolset.initToolSet(this);
    }
}
