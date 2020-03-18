import { computed, reactive, Ref } from '@vue/composition-api';
import _ from 'lodash';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet,
} from '@/lib/toolset';
import { DictInputListState, DictInputToolSet, toDictInputTSList } from '@/components/molecules/forms/dict-input/DictInput.toolset';
import { DataTablePropsType, DataTableState } from '@/components/organisms/tables/data-table/toolset';
import { makeProxy } from '@/lib/compostion-util';

export const dictIGProps = {
    /**
         * Default dict.
         */
    dict: {
        type: Object,
        default: () => ({}),
    },
    /**
         * Disable dict input boxes.
         */
    disabled: {
        type: Boolean,
        default: false,
    },
    /**
         * Show default empty input.
         */
    showEmptyInput: {
        type: Boolean,
        default: false,
    },
    /**
         * Enable validation.
         */
    enableValidation: {
        type: Boolean,
        default: false,
    },
    listState: {
        type: Object,
        default: null,
    },
};


export interface DictIGPropsType {
    dict?: object;
    disabled?: boolean;
    showEmptyInput?: boolean;
    enableValidation?: boolean;
    listState?: DictInputListState<any> | null;
}

@StateToolSet<DictIGPropsType>()
export class DictIGState<D, S extends DictIGPropsType = DictIGPropsType> {
    public state: optionalType<S, D>;

    public static initState() {
        return {
            dict: {},
            disabled: false,
            showEmptyInput: false,
            enableValidation: false,
            listState: null,
        };
    }

    public constructor(initData: D = {} as any as D, lazy: boolean = false) {
        this.state = initReactive(lazy, DictIGState.initState(), initData);
    }
}

export interface DictIGMetaStateType {
    newDict: object;
    isValid: boolean;
}

@HelperToolSet()
export class DictIGToolSet<D=any, SyncD=any> extends DictIGState<D, SyncD> {
    public metaState: DictIGMetaStateType = null as unknown as DictIGMetaStateType;

    public static initToolSet(_this: DictIGToolSet, initMetaData) {
        _this.metaState = reactive({
            newDict: {},
            isValid: false,
            ...initMetaData,
        });
    }

    public constructor(initData: D = {} as any, initMetaData?: object, lazy: boolean = false) {
        super(initData);
        if (!lazy) {
            DictIGToolSet.initToolSet(this, initMetaData);
        }
    }

    public onDictValidate(isValid: boolean, newDict: object) {
        this.metaState.isValid = isValid;
        if (isValid) this.metaState.newDict = newDict;
    }

    public reset(dict: object = {}) {
        this.metaState.newDict = dict;
        this.metaState.isValid = false;
    }

    // public validateAll() {
    //
    // }
}
