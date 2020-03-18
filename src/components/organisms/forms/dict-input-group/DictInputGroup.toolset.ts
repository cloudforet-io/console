import { computed, reactive, Ref } from '@vue/composition-api';
import _ from 'lodash';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet,
} from '@/lib/toolset';
import { DictInputToolSet, toDictInputTSList } from '@/components/molecules/forms/dict-input/DictInput.toolset';

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
};


export interface DictIGPropsType {
    dict?: object;
    disabled?: boolean;
    showEmptyInput?: boolean;
    enableValidation?: boolean;
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
        };
    }

    public constructor(initData: D = {} as any as D, lazy: boolean = false) {
        this.state = initReactive(lazy, DictIGState.initState(), initData);
    }
}

export interface DictIGMetaStateType {
    pairList: DictInputToolSet[];
    newDict: object;
    isAllValid: boolean;
}

@HelperToolSet()
export class DictIGToolSet<D=any, SyncD=any> extends DictIGState<D, SyncD> {
    public metaState: DictIGMetaStateType = null as unknown as DictIGMetaStateType;

    public static initToolSet(_this: DictIGToolSet, initMetaData) {
        _this.metaState = reactive({
            newDict: {},
            pairList: toDictInputTSList(_this.state.dict),
            isAllValid: computed(() => _this.metaState.pairList.every((pair: DictInputToolSet) => pair.isValid.value)),
            ...initMetaData,
        });
    }

    public constructor(initData: D = {} as any, initMetaData?: object, lazy: boolean = false) {
        super(initData);
        if (!lazy) {
            DictIGToolSet.initToolSet(this, initMetaData);
        }
    }

    public setNewDict(pair: DictInputToolSet) {
        this.metaState.newDict[pair.syncState.name] = pair.syncState.value || null;
    }

    public validateAll(): boolean {
        this.metaState.newDict = {};
        let res = true;
        _.forEach(this.metaState.pairList, (pair) => {
            res = pair.validate(this.metaState.newDict) && res;
            if (res) this.setNewDict(pair);
        });
        return res;
    }
}
