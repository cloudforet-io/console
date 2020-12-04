import {
    computed, ref, getCurrentInstance, Ref,
} from '@vue/composition-api';

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
