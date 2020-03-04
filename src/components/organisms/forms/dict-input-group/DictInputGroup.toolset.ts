import { computed, reactive, Ref } from '@vue/composition-api';
import VueI18n from 'vue-i18n';
import _ from 'lodash';

let pairId: number = 0;

export class InputPair {
    public key: string | number;

    public value: string | number;

    public id: number;

    public keyInvalid: boolean = true;

    public valueInvalid: boolean = true;

    public keyInvalidText: Ref<VueI18n.TranslateResult> | string = '';

    public valueInvalidText: Ref<VueI18n.TranslateResult> | string = '';

    public isValid: any = computed(() => !this.keyInvalid && !this.valueInvalid);

    protected vm: any;

    public constructor(
        vm: any, key?: string | number, value?: string | number,
    ) {
        // eslint-disable-next-line no-plusplus
        this.id = pairId++;
        this.key = key || '';
        this.value = value || '';
        this.vm = vm;
    }

    validateKey(newDict: object) {
        if (!this.key) {
            this.keyInvalid = true;
            this.keyInvalidText = this.vm.$t('ACTION.DICT.INVALID.KEY_EMPTY');
        } else if (newDict[this.key] !== undefined) {
            this.keyInvalid = true;
            this.keyInvalidText = this.vm.$t('ACTION.DICT.INVALID.KEY_DUPL');
        } else this.keyInvalid = false;
        return !this.keyInvalid;
    }

    validateValue() {
        if (!this.value) {
            this.valueInvalid = true;
            this.valueInvalidText = this.vm.$t('ACTION.DICT.INVALID.VAL_EMPTY');
        } else this.valueInvalid = false;
        return !this.valueInvalid;
    }

    validate(newDict: object) {
        this.validateKey(newDict);
        this.validateValue();
        return !this.keyInvalid && !this.valueInvalid;
    }
}

export const dictToArray = (dict: object = {}, vm: any): any[] => {
    const res: any = [];
    _.forEach(dict, (v, k) => {
        res.push(new InputPair(vm, k, v));
    });
    return res;
};

export const getProps = () => ({
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
});


export interface DictIGPropsType {
    dict?: object,
    disabled?: boolean;
    showEmptyInput?: boolean;
    enableValidation?: boolean;
}

export class DictIGState {
    public state: DictIGPropsType;

    static initState: DictIGPropsType = {
        dict: {},
        disabled: false,
        showEmptyInput: false,
        enableValidation: false,
    }

    constructor(initData: object = {}) {
        this.state = reactive({
            ...DictIGState.initState,
            ...initData,
        });
    }
}
