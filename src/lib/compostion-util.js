import { computed, onUnmounted, reactive } from '@vue/composition-api';

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
    };
};


export const requiredValidation = invalidMessage => new Validation(value => !!value, invalidMessage || 'value is required');
export const numberMinValidation = (min, invalidMessage) => new Validation(value => Number(value) >= min, invalidMessage || `value must bigger then ${min}`);
export const numberMaxValidation = (max, invalidMessage) => new Validation(value => Number(value) >= max, invalidMessage || `value must smaller then ${max}`);
export const lengthMinValidation = (min, invalidMessage) => new Validation(value => value.length >= min, invalidMessage);
export const lengthMaxValidation = (max, invalidMessage) => new Validation(value => value.length >= max, invalidMessage);

export const userIDValidation = (parent, invalidMessage) => new Validation(async (value) => {
    let result = false;
    await parent.$http.post('/identity/user/get', { user_id: value, domain_id: sessionStorage.domainId }).then().catch((error) => {
        if (error.code === 'ERROR_NOT_FOUND') {
            result = true;
        }
    });
    return result;
}, invalidMessage || 'already use that user id');

