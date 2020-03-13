import {
    computed, reactive, Ref, getCurrentInstance,
} from '@vue/composition-api';
import VueI18n from 'vue-i18n';

import _ from 'lodash';
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { i18n } from '@/translations';

interface DictInputType {
    keyInvalid?: boolean;
    valueInvalid?: boolean;
    keyInvalidText?: VueI18n.TranslateResult | Ref<VueI18n.TranslateResult> | string;
    valueInvalidText?: VueI18n.TranslateResult | Ref<VueI18n.TranslateResult> | string;
    disabled?: boolean;
}

interface DictInputSyncType {
    name: string;
    value: number | string;
}

export interface DictInputPropsInterface extends DictInputType, DictInputSyncType {}


@StateToolSet<DictInputType>()
@SyncStateToolSet<DictInputSyncType>()
export class DictInputState<
    D, SyncD,
    S extends DictInputType = DictInputType,
    SyncS extends DictInputSyncType = DictInputSyncType
    > {
    public state: optionalType<S, D>;

    public syncState: optionalType<SyncS, SyncD>;

    static initState() {
        return {
            keyInvalid: false,
            valueInvalid: false,
            keyInvalidText: undefined,
            valueInvalidText: undefined,
            disabled: false,
        };
    }

    static initSyncState() {
        return {
            name: '',
            value: '',
        };
    }

    constructor(initData: D = <D>{}, initSyncData: SyncD = <SyncD>{}, lazy: boolean = false) {
        this.state = initReactive(lazy, DictInputState.initState(), initData);
        this.syncState = initReactive(lazy, DictInputState.initSyncState(), initSyncData);
    }
}

interface metaStateType {
    id: number;
    isValid: boolean;
}

@HelperToolSet()
export class DictInputToolSet<D = any, SyncD = any> extends DictInputState<D, SyncD> {
    public metaState: metaStateType = null as unknown as metaStateType;

    static i18n: VueI18n = i18n;

    static count: number = 0;

    static initToolSet(_this: DictInputToolSet) {
        _this.metaState = reactive({
            isValid: computed(() => !_this.state.keyInvalid && !_this.state.valueInvalid),
            // eslint-disable-next-line no-plusplus
            id: DictInputToolSet.count++,
        });
    }

    constructor(initData: D | any = <D>{}, initSyncData: SyncD = <SyncD>{}, lazy = false) {
        super(initData, initSyncData);
        if (!lazy) {
            DictInputToolSet.initToolSet(this);
        }
    }

    validateKey(newDict: object) {
        if (!this.syncState.name) {
            this.state.keyInvalid = true;
            this.state.keyInvalidText = DictInputToolSet.i18n.t('ACTION.DICT.INVALID.KEY_EMPTY');
        } else if (newDict[this.syncState.name] !== undefined) {
            this.state.keyInvalid = true;
            this.state.keyInvalidText = DictInputToolSet.i18n.t('ACTION.DICT.INVALID.KEY_DUPL');
        } else this.state.keyInvalid = false;
        return !this.state.keyInvalid;
    }

    validateValue() {
        if (!this.syncState.value) {
            this.state.valueInvalid = true;
            this.state.valueInvalidText = DictInputToolSet.i18n.t('ACTION.DICT.INVALID.VAL_EMPTY');
        } else this.state.valueInvalid = false;
        return !this.state.valueInvalid;
    }

    validate(newDict: object) {
        this.validateKey(newDict);
        this.validateValue();
        return !this.state.keyInvalid && !this.state.valueInvalid;
    }
}

export const toDictInputTSList = (dict: object = {}): DictInputToolSet[] => {
    const res: DictInputToolSet[] = [];
    _.forEach(dict, (v, k) => {
        res.push(new DictInputToolSet(undefined, {
            name: k, value: v,
        }));
    });
    return res;
};

export const dictInputProps = {
    name: {
        type: String,
        default: '',
        required: true,
    },
    /**
     * Value of dict. This is sync prop.
     */
    value: {
        type: [String, Number],
        default: '',
        required: true,
    },
    /**
     * Key invalid.
     */
    keyInvalid: {
        type: Boolean,
        default: false,
    },
    /**
     * Value invalid.
     */
    valueInvalid: {
        type: Boolean,
        default: false,
    },
    /**
     * Key invalid message.
     */
    keyInvalidText: {
        type: String,
        default: undefined,
    },
    /**
     * Value invalid message.
     */
    valueInvalidText: {
        type: String,
        default: undefined,
    },
    /**
     * Disable key, value input boxes.
     */
    disabled: {
        type: Boolean,
        default: false,
    },
};
