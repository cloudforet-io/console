import {
    computed, onUnmounted, reactive, ref, onMounted,
} from '@vue/composition-api';
import _ from 'lodash';

/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
export const makeProxy = (name, props, emit) => computed({
    get: () => props[name],
    set: val => emit(`update:${name}`, val),
});

/**
 * event by pass
 * @param emit
 * @param name
 * @return {function(...[*]=)}
 */
export const makeByPass = (emit, name) => (...event) => {
    emit(name, ...event);
};

/**
 * auto mount&unmount event on bus
 * @param bus page event bus
 * @param eventName
 * @param handler
 */
export const mountBusEvent = (bus, eventName, handler) => {
    bus.$on(eventName, handler);
    onUnmounted(() => bus.$off(eventName, handler));
};

/**
 * 여러 엘리먼트에서 마우스 오버 여부 추적에 필요한 함수 모
 * @param disabled
 * @return {{onMouseOut: onMouseOut, isMouseOver: Ref<HasDefined<S> extends true ? S : RefValue<T>>, onMouseOver: onMouseOver}}
 */
export const mouseOverState = (disabled) => {
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
 * 윈도우 이벤트 등록 함수
 * 자동완성, 드롭다운 컨텍스트 메뉴 팝업을 자동으로 닫게 할때 활용
 * @param func
 */
export const windowEventMount = (eventName, func) => {
    onMounted(() => window.addEventListener(eventName, func));
    onUnmounted(() => window.removeEventListener(eventName, func));
};


export class Validation {
    /**
     * make new validation
     * @param func validation func, if invalid return false
     * @param invalidMessage
     */
    constructor(func, invalidMessage) {
        this.func = func;
        this.invalidMessage = invalidMessage;
    }
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
 *          invalidState: UnwrapRef<any>
 *          }
 *      }
 */
export const formValidation = (data, validation) => {
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
    const fieldValidation = async (name) => {
        const vds = validation[name];
        for (let i = 0; i < vds.length; i++) {
            const vd = vds[i];
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

export const requiredValidation = invalidMessage => new Validation((value) => {
    if (['boolean', 'number'].includes(typeof value)) return true;
    if (value instanceof Array) return !!value.length;
    return !_.isEmpty(value); // String, Object
}, invalidMessage || 'Required field!');
export const jsonParseValidation = invalidMessage => new Validation((value) => {
    try {
        JSON.parse(value);
    } catch (e) {
        return false;
    }
    return true;
},
invalidMessage || 'Invalid Json string format!');
export const numberMinValidation = (min, invalidMessage) => new Validation(value => Number(value) >= min, invalidMessage || `value must bigger then ${min}`);
export const numberMaxValidation = (max, invalidMessage) => new Validation(value => Number(value) >= max, invalidMessage || `value must smaller then ${max}`);
export const lengthMinValidation = (min, invalidMessage) => new Validation(value => value.length >= min, invalidMessage);
export const lengthMaxValidation = (max, invalidMessage) => new Validation(value => value.length >= max, invalidMessage);

export const credentialsNameValidation = (parent, invalidMessage) => new Validation(async (value) => {
    let result = false;
    await parent.$http.post('/secret/credential/list', { name: value, domain_id: sessionStorage.domainId }).then((res) => {
        if (res.data.total_count === 0) {
            result = true;
        }
    }).catch((error) => {
        console.log(error);
    });
    debugger;
    return result;
}, invalidMessage || 'same name exists!');

export const userIDValidation = (parent, invalidMessage) => new Validation(async (value) => {
    let result = false;
    await parent.$http.post('/identity/user/get', { user_id: value, domain_id: sessionStorage.domainId }).then().catch((error) => {
        if (error.code === 'ERROR_NOT_FOUND') {
            result = true;
        }
    });
    return result;
}, invalidMessage || 'same ID exists!');
