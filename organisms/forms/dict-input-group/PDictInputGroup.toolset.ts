import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import {
    map, some, forEach, debounce, every,
} from 'lodash';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { requiredValidation, Validation } from '@/components/util/composition-helpers';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export const dictIGProps = {
    /**
     * sync
     */
    items: {
        type: Array,
        default: () => [],
    },
    showValidation: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    showEmptyInput: {
        type: Boolean,
        default: false,
    },
    invalidMessages: {
        type: Object,
        default: () => ({}),
    },
    showHeader: {
        type: Boolean,
        default: false,
    },
};

export class DictItem {
    private static count = 0;

    key: string | number;

    value: string | number;

    constructor(key?: string | number, value?: string | number) {
        this.key = key || '';
        this.value = value || '';
        DictItem.count += 1;
    }
}

interface InvalidMessage { [idx: number]: { key: string; value: string } }

export interface DictIGType {
    disabled: boolean;
    showEmptyInput: boolean;
    showValidation: boolean;
    invalidMessages: InvalidMessage;
}

export interface DictIGSyncType {
    items: DictItem[];
}

export interface DictIGPropsType extends DictIGType, DictIGSyncType {}

@StateToolSet<DictIGType>()
@SyncStateToolSet<DictIGSyncType>()
export class DictIGState<D, SyncD,
    S extends DictIGType = DictIGType,
    SyncS extends DictIGSyncType = DictIGSyncType> {
    state: optionalType<S, D>;

    syncState: optionalType<SyncS, SyncD>;

    static initState(): DictIGType {
        return {
            disabled: false,
            showEmptyInput: false,
            showValidation: false,
            invalidMessages: {},
        };
    }

    static initSyncState(): DictIGSyncType {
        return {
            items: [],
        };
    }

    constructor(initData: D = {} as D, initSyncData: SyncD = {} as SyncD, lazy = false) {
        this.state = initReactive(lazy, DictIGState.initState(), initData);
        this.syncState = initReactive(lazy, DictIGState.initSyncState(), initSyncData);
    }
}

interface DictValidationItemType {
    key: Validation[];
    value: Validation[];
}

interface DictValidationType {
    [idx: number]: DictValidationItemType;
}

export const toDictItems = (dict: object = {}): DictItem[] => map(dict, (v, k) => new DictItem(k, v));

export const getValidations = (items: Readonly<DictItem[]>): DictValidationType => {
    const res: DictValidationType = {};

    items.forEach((di: DictItem, idx: number) => {
        res[idx] = {
            key: [
                requiredValidation('no key'),
                new Validation((val, data: DictItem[], itemIdx: number) => {
                    let isDuplicated = false;
                    some(data, (d, i) => {
                        if (d.key === val && itemIdx !== i) isDuplicated = true;
                        return isDuplicated || itemIdx <= i;
                    });
                    return !isDuplicated;
                },
                'duplicated key'),
            ],
            value: [requiredValidation('no value')],
        };
    });

    return res;
};

export const dictValidation = (data: Readonly<Ref<Readonly<DictItem[]>>>) => {
    const validations: Ref<DictValidationType> = computed(() => getValidations(data.value));

    const invalidMessages = ref({});

    const typeValidation = (idx: number, type: string) => {
        const vds: Validation[] = validations.value[idx][type];
        const isValid = vds.every((vd: Validation) => {
            const check = vd.func(data.value[idx][type], data.value, idx);
            const msg = check ? '' : vd.invalidMessage;
            invalidMessages.value = {
                ...invalidMessages.value,
                [idx]: { ...invalidMessages.value[idx], [type]: msg },
            };
            return check;
        });
        return isValid;
    };

    const itemValidation = (idx: number, type?: string) => {
        let res = true;
        if (type) res = typeValidation(idx, type);
        else {
            ['key', 'value'].forEach((t) => {
                res = typeValidation(idx, t) && res;
            });
        }
        return res;
    };


    const allValidation = (type?: string, reset = true) => {
        if (reset) invalidMessages.value = {};

        let result = true;
        forEach(data.value, (d, idx) => {
            result = itemValidation(idx, type) && result;
        });
        return result;
    };

    return {
        itemValidation,
        allValidation,
        invalidMessages,
    };
};

export const getNewDict = (items: DictItem[], invalidMessages: InvalidMessage) => {
    const res = {};
    forEach(items, (item, idx) => {
        if (!invalidMessages[idx].key) { res[item.key] = item.value; }
    });
    return res;
};

interface VdState {
    isAllValid: boolean;
    newDict: {[id: string]: string};
}

@HelperToolSet()
export class DictIGToolSet<D=any, SyncD=DictIGSyncType> extends DictIGState<D, SyncD> {
    allValidation: ((type?: string, reset?: boolean) => boolean) = null as any;

    itemValidation: (idx: number, type?: string) => boolean = null as any;

    vdState: UnwrapRef<VdState> = null as unknown as UnwrapRef<VdState>;

    events: any = {
        'change:value': debounce((idx) => { this.itemValidation(idx, 'value'); }, 100),
        'change:key': debounce(() => { this.allValidation('key', false); }, 100),
        'change:add': (idx) => { this.itemValidation(idx); },
        'change:delete': () => { this.allValidation(); },
    };

    static initToolSet(_this: DictIGToolSet): void {
        const vds = dictValidation(computed(() => _this.syncState.items));
        _this.allValidation = vds.allValidation;
        _this.itemValidation = vds.itemValidation;
        _this.state.invalidMessages = vds.invalidMessages;
        _this.vdState = reactive({
            isAllValid: computed(() => every(_this.state.invalidMessages, (item: any) => !item.key && !item.value)),
            newDict: computed(() => getNewDict(_this.syncState.items, _this.state.invalidMessages)),
        });
    }

    constructor(initData: D = {} as D, initSyncData: SyncD = {} as SyncD, lazy = false) {
        super(initData, initSyncData);

        if (!lazy) {
            DictIGToolSet.initToolSet(this);
        }
    }
}
