import {
    computed, onUnmounted, reactive, ref, onMounted, getCurrentInstance, Ref,
} from '@vue/composition-api';
import _ from 'lodash';
import moment from 'moment-timezone';
import VueI18n from 'vue-i18n';
import { isNotEmpty } from '@/lib/util';

/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
/* eslint-disable arrow-parens */
export const makeProxy = <T extends any>(name: string, props: any = null, emit: any = null): Ref<T> => {
    let _props = props;
    let _emit = emit;
    if (!_props && !_emit) {
        const vm = getCurrentInstance();
        if (vm) {
            _props = vm.$props;
            _emit = vm.$listeners[`update:${name}`];
        } else {
            console.error('unsupported get current instance method');
        }
    }
    return computed({
        get: () => _props[name],
        set: val => {
            if (emit) {
                emit(`update:${name}`, val);
            } else {
                _emit(val);
            }
        },
    });
};


/**
 * 여러 엘리먼트에서 마우스 오버 여부 추적에 필요한 함수 모음
 * @param disabled
 * @return {{onMouseOut: onMouseOut, isMouseOver: Ref<HasDefined<S> extends true ? S : RefValue<T>>, onMouseOver: onMouseOver}}
 */
export const mouseOverState = (disabled?: boolean) => {
    const disable = disabled || false;
    const isMouseOver = ref(false);
    const onMouseOver = () => {
        if (!disable && !isMouseOver.value) {
            isMouseOver.value = true;
        }
    };
    const onMouseOut = () => {
        if (!disable && isMouseOver.value) {
            isMouseOver.value = false;
        }
    };
    return {
        isMouseOver,
        onMouseOver,
        onMouseOut,
    };
};

type validationFunction = (value: any, data?: any, options?: any) => boolean|Promise<boolean>;
type message = string|VueI18n.TranslateResult;

export class Validation {
    /**
     * make new validation
     * @param func validation func, if invalid return false
     * @param invalidMessage
     */
    constructor(public func: validationFunction, public invalidMessage?: message) { }
}

/**
 * add form validation process
 * @param data  reactive data
 * @param validation validation functions
 * @return {
 *          {
 *          allValidation: (function(): boolean),
 *          validState: UnwrapRef<any>,
 *          fieldValidation: fieldValidation,
 *          invalidMsg: UnwrapRef<any>,
 *          invalidState: Ref<any>
 *          }
 *      }
 */
export const formValidation = (data: any, validation: object) => {
    const validationFields = Object.keys(validation);
    const invalidMsg = reactive(Object.fromEntries(validationFields.map(x => [x, ''])));
    const invalidState = reactive(Object.fromEntries(validationFields.map(x => [x, false])));
    const validState = reactive(Object.fromEntries(validationFields.map(x => [x, false])));
    const isAllValid = computed(() => _.every(invalidState, val => val === false));
    /**
     * validated only one field
     * @param name
     * @return {boolean}
     */
    const fieldValidation = async (name: string) => {
        const vds = validation[name];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < vds.length; i++) {
            const vd = vds[i];
            // eslint-disable-next-line no-await-in-loop
            const check = await vd.func(data[name], data);
            if (!check) {
                invalidMsg[name] = vd.invalidMessage;
                invalidState[name] = true;
                return false;
            }
        }
        invalidState[name] = false;
        validState[name] = true;
        return true;
    };
    /**
     * validated all fields
     * @return {boolean}
     */
    const allValidation = async () => {
        let result = true;
        const vds = Object.keys(validation);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < vds.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            const validateResult = await fieldValidation(vds[i]);
            if (!validateResult) {
                result = false;
            }
        }
        return result;
    };
    return {
        fieldValidation,
        allValidation,
        invalidMsg,
        invalidState,
        validState,
        isAllValid,
    };
};

export const requiredValidation = (invalidMessage?: message) => new Validation(value => isNotEmpty(value), invalidMessage || 'Required field!');
