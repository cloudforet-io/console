<template>
    <component :is="component"
               :options="proxy.options"
               :data="proxy.data"
               :type-options="proxy.typeOptions"
               :extra-data="proxy.extraData"
               :before-create="proxy.beforeCreate"
               :handler="proxy.handler"
               v-on="$listeners"
    />
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { dynamicFieldTypes } from '@/components/organisms/dynamic-field/type/field-schema';
import { cloneDeep, merge, debounce } from 'lodash';

interface State {
    component: any;
    loader: () => Promise<any>;
}
const RECURSIVE_TYPE = ['list', 'enum'];

export default {
    name: 'PDynamicField',
    props: {
        type: {
            type: String,
            default: 'text',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: DynamicFieldProps, { emit }) {
        // noinspection TypeScriptCheckImport
        const state = reactive<any>({
            component: null,
            // nextHandler: props.handler,
            proxy: cloneDeep(props) as DynamicFieldProps,
        });

        const setProxy = (field: Partial<DynamicFieldProps> = {}) => {
            state.proxy = merge(field, state.proxy);
        };

        const loadComponent = async () => {
            try {
                /* For types that recursively use dynamic fields, do not run handler */
                if (state.proxy.handler && !RECURSIVE_TYPE.includes(state.proxy.type)) {
                    let res = state.proxy.handler(state.proxy);
                    if (res instanceof Promise) res = await res;

                    setProxy(res);

                    /* When type change occurs through Handler, for types that recursively use dynamic fields, do not inherit handler. */
                    if (state.proxy.type !== props.type && RECURSIVE_TYPE.includes(res.type)) {
                        state.proxy.handler = undefined;
                    }
                }

                if (!dynamicFieldTypes.includes(state.proxy.type)) {
                    throw new Error(`[DynamicField] Unacceptable Type:
                                    field type must be one of ${dynamicFieldTypes}.
                                    ${state.proxy.type} is not acceptable.`);
                }

                state.component = () => import(`./templates/${state.proxy.type}/index.vue`);
            } catch (e) {
                state.component = () => import('./templates/text/index.vue');
            }
        };


        (async () => {
            if (props.beforeCreate) {
                const res = props.beforeCreate(props);
                if (res) await res;
            }
            await loadComponent();

            watch([() => props.type, () => props.options, () => props.data, () => props.typeOptions], async () => {
                await loadComponent();
            });

        })();


        return {
            ...toRefs(state),
            // proxy,
        };
    },
};
</script>
