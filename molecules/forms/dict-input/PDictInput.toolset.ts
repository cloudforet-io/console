import {
    Ref,
} from '@vue/composition-api';
import VueI18n from 'vue-i18n';

import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';

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
    state: optionalType<S, D>;

    syncState: optionalType<SyncS, SyncD>;

    static initState(): DictInputType {
        return {
            keyInvalid: false,
            valueInvalid: false,
            keyInvalidText: undefined,
            valueInvalidText: undefined,
            disabled: false,
        } as DictInputType;
    }

    static initSyncState(): DictInputSyncType {
        return {
            name: '',
            value: '',
        } as DictInputSyncType;
    }

    constructor(initData: D = {} as D, initSyncData: SyncD = {} as SyncD, lazy = false) {
        this.state = initReactive(lazy, DictInputState.initState(), initData);
        this.syncState = initReactive(lazy, DictInputState.initSyncState(), initSyncData);
    }
}

export const dictInputProps = {
    /**
     * sync
     */
    name: {
        type: String,
        default: '',
        required: true,
    },
    /**
     * sync
     */
    value: {
        type: [String, Number],
        default: '',
        required: true,
    },
    keyInvalid: {
        type: Boolean,
        default: false,
    },
    valueInvalid: {
        type: Boolean,
        default: false,
    },
    keyInvalidText: {
        type: String,
        default: undefined,
    },
    valueInvalidText: {
        type: String,
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
};
