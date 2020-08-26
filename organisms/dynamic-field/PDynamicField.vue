<template>
    <component :is="component"
               :options="proxy.options"
               :data="proxy.data"
               :typeOptions="proxy.typeOptions"
               :before-create="beforeCreate"
               :handler="handler"
               v-on="$listeners"
    />
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicFieldMutableProps, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { makeProxy } from '@/components/util/composition-helpers';


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
            default: '',
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
            proxy: computed<DynamicFieldMutableProps>(() => {
                const res: DynamicFieldMutableProps = {
                    options: props.options,
                    data: props.data,
                    typeOptions: props.typeOptions,
                };
                if (props.handler) return props.handler(res);

                return res;
            }),
        });
        onMounted(async () => {
            try {
                if (props.beforeCreate) {
                    const res = props.beforeCreate(props);
                    if (res instanceof Promise) await res;
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
