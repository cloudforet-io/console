import {
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, ref, Ref,
} from '@vue/composition-api';
import { every } from 'lodash';
import VueI18n from 'vue-i18n';
import { isNotEmpty } from '@/components/util/helpers';
import { ComponentInstance } from '@vue/composition-api/dist/component';

/**
 * Event listeners by pass
 * @param listeners
 * @param name
 * @param event params
 */
export const makeByPassListeners = (listeners: Record<string, Function | Function[]>, name: string, ...args: any[]) => {
    // @ts-ignore
    if (Array.isArray(listeners[name])) listeners[name].forEach(f => f(...args));
    // @ts-ignore
    else if (typeof listeners[name] === 'function') listeners[name](...args);
};

/**
 * event by pass
 * @param emit
 * @param name
 * @return {function(...[*]=)}
 */
export const makeByEvent = (emit: any, name: string) => (...event: any) => {
    emit(name, ...event);
};


/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
export const makeProxy = <T extends any>(name: string, props: any, emit: any): Ref<T> => computed({
    get: () => props[name],
    set: (val) => {
        emit(`update:${name}`, val);
    },
});

/**
 * make proxy computed or a value if there's no listener for tracking sync
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
export function makeOptionalProxy<T extends any>(name: string, vm: ComponentInstance): Ref<T>|T {
    if (vm.$listeners[`update:${name}`]) {
        return computed({
            get: () => vm.$props[name],
            set: (val) => {
                vm.$emit(`update:${name}`, val);
            },
        });
    }
    return vm.$props[name];
}


export function makeVModelProxy<T extends any>(name = 'value', event = 'input', transform: ((val: any) => any)|null = null): Ref<T> {
    const vm = getCurrentInstance() as ComponentInstance;
    let setter: (val: any) => void;
    if (transform) {
        setter = (val) => { vm.$emit(event, transform(val)); };
    } else {
        setter = (val) => { vm.$emit(event, val); };
    }

    return computed({
        get: () => vm?.$props[name],
        set: setter,
    });
}


/**
 * state & functions for tracking elements whether they are mouse-over or out.
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


/**
 * Add and remove an event listener when mounted & unmounted.
 * This is useful to automatically hide autocomplete or dropdown context menu.
 * @param eventName
 * @param func
 */
export const windowEventMount = (eventName: string, func: any) => {
    onMounted(() => window.addEventListener(eventName, func));
    onUnmounted(() => window.removeEventListener(eventName, func));
};


type validationFunction = (value: any, data?: any, options?: any) => boolean|Promise<boolean>;
type message = string|VueI18n.TranslateResult;


/**
 * use it when generate validation function
 */
export class Validation {
    /**
     * make new validation
     * @param func validation func, if invalid return false
     * @param invalidMessage
     */
    constructor(public func: validationFunction, public invalidMessage?: message) { }
}


/**
 * use it when make validation for data form.
 * returns a set of state & functions for validation.
 * @param data
 * @param validation validation function map
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
    const isAllValid = computed(() => every(invalidState, val => val === false));
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
