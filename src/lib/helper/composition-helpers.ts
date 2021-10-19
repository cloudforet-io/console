import {
    computed, getCurrentInstance, Ref,
} from '@vue/composition-api';

/**
 * make proxy computed that same name as props
 * @param name
 * @param props
 * @param emit
 * @return {Ref<*>}
 */
export function makeProxy<T = any>(name: string, props: any = null, emit: any = null): Ref<T> {
    let newProps = props;
    let newEmit = emit;
    if (!newProps && !newEmit) {
        const vm = getCurrentInstance();
        if (vm) {
            newProps = vm.$props;
            newEmit = vm.$listeners[`update:${name}`];
        } else {
            console.error('unsupported get current instance method');
        }
    }
    return computed({
        get: () => newProps[name],
        set: (val) => {
            if (emit) {
                emit(`update:${name}`, val);
            } else {
                newEmit(val);
            }
        },
    });
}
