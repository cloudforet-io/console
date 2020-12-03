<template>
    <component :is="component"
               :options="proxy.options"
               :data="proxy.data"
               :type-options="proxy.typeOptions"
               :extra-data="proxy.extraData"
               :before-create="proxy.beforeCreate"
               :handler="nextHandler"
               v-on="$listeners"
    />
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { dynamicFieldTypes } from '@/components/organisms/dynamic-field/type/field-schema';


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
            nextHandler: props.handler,
        });


        const loadComponent = async (fieldProps: DynamicFieldProps) => {
            try {
                if (!dynamicFieldTypes.includes(fieldProps.type)) {
                    throw new Error(`[DynamicField] Unacceptable Type:
                                    field type must be one of ${dynamicFieldTypes}.
                                    ${fieldProps.type} is not acceptable.`);
                }

                state.component = () => import(`./templates/${fieldProps.type}/index.vue`);
            } catch (e) {
            }
        };

        const proxy = computed<DynamicFieldProps>(() => {
            const res: DynamicFieldProps = {
                type: props.type,
                options: props.options,
                data: props.data,
                typeOptions: props.typeOptions,
                extraData: props.extraData,
                beforeCreate: props.beforeCreate,
                handler: props.handler,
            };

            /**
             * For types that recursively use dynamic fields, do not run handler
             * */
            if (props.handler && !RECURSIVE_TYPE.includes(res.type)) {
                const handlerRes = props.handler(Object.freeze(props));
                if (handlerRes.type) res.type = handlerRes.type;
                if (handlerRes.data) res.data = handlerRes.data;
                if (handlerRes.beforeCreate) res.beforeCreate = handlerRes.beforeCreate;
                if (handlerRes.handler) res.handler = handlerRes.handler;
                if (handlerRes.options) res.options = { ...res.options, ...handlerRes.options };
                if (res.typeOptions) res.typeOptions = { ...res.typeOptions, ...handlerRes.typeOptions };
                if (res.extraData) res.extraData = { ...res.extraData, ...handlerRes.extraData };

                /**
                 * Load component(=Dynamic Field) again if type change occurs through Handler.
                 * For types that recursively use dynamic fields, do not inherit handler.
                 */
                if (res.type !== props.type) {
                    if (RECURSIVE_TYPE.includes(res.type)) state.nextHandler = undefined;
                    loadComponent(res);
                }
            }
            return res;
        });


        onMounted(async () => {
            if (props.beforeCreate) {
                const res = props.beforeCreate(props);
                if (res) await res;
            }
            await loadComponent(props);
        });

        return {
            ...toRefs(state),
            proxy,
        };
    },
};
</script>
