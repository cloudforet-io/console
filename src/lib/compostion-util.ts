import {
    computed, onUnmounted, reactive, ref, onMounted,
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
export const makeProxy = (name:string, props:any, emit:any) => computed({
    get: () => props[name],
    set: val => emit(`update:${name}`, val),
});

/**
 * event by pass
 * @param emit
 * @param name
 * @return {function(...[*]=)}
 */
export const makeByPass = (emit:any, name:string) => (...event: any) => {
    emit(name, ...event);
};

/**
 * auto mount&unmount event on bus
 * @param bus page event bus
 * @param eventName
 * @param handler
 */
export const mountBusEvent = (bus:any, eventName:string, handler:Function) => {
    bus.$on(eventName, handler);
    onUnmounted(() => bus.$off(eventName, handler));
};

/**
 * 여러 엘리먼트에서 마우스 오버 여부 추적에 필요한 함수 모음
 * @param disabled
 * @return {{onMouseOut: onMouseOut, isMouseOver: Ref<HasDefined<S> extends true ? S : RefValue<T>>, onMouseOver: onMouseOver}}
 */
export const mouseOverState = (disabled?:boolean) => {
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
 * @param eventName
 * @param func
 */
export const windowEventMount = (eventName:string, func:any) => {
    onMounted(() => window.addEventListener(eventName, func));
    onUnmounted(() => window.removeEventListener(eventName, func));
};
type validationFunction = (value:any, data?: any)=> boolean|Promise<boolean>;
type message = string|VueI18n.TranslateResult;

export class Validation {
    /**
     * make new validation
     * @param func validation func, if invalid return false
     * @param invalidMessage
     */
    constructor(public func:validationFunction, public invalidMessage:message) { }
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
export const formValidation = (data:any, validation:object) => {
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
    const fieldValidation = async (name:string) => {
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
        let result :boolean = true;
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

export const requiredValidation = (invalidMessage:message) => new Validation(value => isNotEmpty(value), invalidMessage || 'Required field!');

export const jsonParseValidation = (invalidMessage:message) => new Validation((value) => {
    try {
        if (value[0] !== '{' && value[value.length - 1] !== '}') return false;
        JSON.parse(value);
    } catch (e) {
        return false;
    }
    return true;
},
invalidMessage || 'Invalid Json string format!');
export const numberMinValidation = (min:number, invalidMessage:message) => new Validation(value => (value ? Number(value) >= min : true), invalidMessage || `value must bigger then ${min}`);
export const numberMaxValidation = (max:number, invalidMessage:message) => new Validation(value => (value ? Number(value) <= max : true), invalidMessage || `value must smaller then ${max}`);
export const lengthMinValidation = (min:number, invalidMessage:message) => new Validation(value => (value ? value.length >= min : true), invalidMessage || `value length must bigger then ${min}`);
export const lengthMaxValidation = (max:number, invalidMessage:message) => new Validation(value => (value ? value.length <= max : true), invalidMessage || `value length must smaller then ${max}`);
export const checkTimeZoneValidation = (invalidMessage:message) => new Validation(value => (value ? moment.tz.names().indexOf(value) !== -1 : true), invalidMessage || 'can not find timezone');

export const credentialsNameValidation = (parent:any, invalidMessage:message) => new Validation(async (value) => {
    let result = false;
    await parent.$http.post('/secret/credential/list', { name: value, domain_id: sessionStorage.domainId }).then((res) => {
        if (res.data.total_count === 0) {
            result = true;
        }
    }).catch((error) => {
        console.error(error);
    });
    return result;
}, invalidMessage || 'same name exists!');

export const userIDValidation = (parent:any, invalidMessage:message) => new Validation(async (value) => {
    let result = false;
    // eslint-disable-next-line camelcase
    await parent.$http.post('/identity/user/get', { user_id: value, domain_id: sessionStorage.domainId }).then().catch((error) => {
        if (error.code === 'ERROR_NOT_FOUND') {
            result = true;
        }
    });
    return result;
}, invalidMessage || 'same ID exists!');

export const pluginAuthIDValidation = (parent:any) => new Validation(async (value:string) => {
    let result:boolean = true;
    // eslint-disable-next-line camelcase
    await parent.$http.post('/identity/user/find', { search: { user_id: value }, domain_id: sessionStorage.domainId, query: { count_only: true } }).then((res) => {
        if (res.data.total_count === 0) { result = true; }
    }).catch((error) => { console.debug(error); });
    return result;
}, "ID doesn't exists!");
