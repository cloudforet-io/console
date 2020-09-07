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
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicFieldHandler, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';


interface State {
    component: any;
    loader: () => Promise<any>;
}

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
            type: [String, Object, Array, Boolean, Number, null],
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
            loader: computed<() => Promise<any>>(() => () => import(`./templates/${props.type}/index.vue`)) as unknown as () => Promise<any>,
            proxy: computed<DynamicFieldProps>(() => {
                let res: DynamicFieldProps = {
                    type: props.type,
                    options: props.options,
                    data: props.data,
                    typeOptions: props.typeOptions,
                    extraData: props.extraData,
                    beforeCreate: props.beforeCreate,
                    handler: props.handler,
                };
                if (props.handler) {
                    if (['list', 'enum'].includes(props.type)) res.handler = undefined;
                    res = { ...res, ...props.handler(props) };
                }
                return res;
            }),
        });
        onMounted(async () => {
            try {
                if (props.beforeCreate) {
                    const res = props.beforeCreate(props);
                    if (res) await res;
                }
                state.component = async () => state.loader();
            } catch (e) {
                state.component = () => import('./templates/text/index.vue');
            }
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
