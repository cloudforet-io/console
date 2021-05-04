<template>
    <fragment>
        <p-text-list v-if="type !== 'list' && Array.isArray(data)"
                     :items="data"
                     :delimiter="options.delimiter"
        >
            <template #default="{value}">
                <p-dynamic-field :options="options"
                                 :data="value"
                                 :type-options="typeOptions"
                                 :extra-data="extraData"
                                 :handler="handler"
                                 v-on="$listeners"
                />
            </template>
            <template v-if="!options.delimiter" #delimiter>
                <br/>
            </template>
        </p-text-list>
        <component :is="component"
                   v-else
                   :options="proxy.options"
                   :data="proxy.data"
                   :type-options="proxy.typeOptions"
                   :extra-data="proxy.extraData"
                   :handler="nextHandler"
                   v-on="$listeners"
        />
    </fragment>
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTextList from '@/others/console/text-list/PTextList.vue';


interface State {
    component: any;
    loader: () => Promise<any>;
}
const RECURSIVE_TYPE = ['list', 'enum'];

const PDynamicField = import('@/data-display/dynamic/dynamic-field/PDynamicField.vue');

export default {
    name: 'PDynamicField',
    components: { PTextList, PDynamicField },
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
        handler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: DynamicFieldProps, { emit }) {
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

                // noinspection TypeScriptCheckImport
                state.component = () => import(/* webpackMode: "eager" */ `./templates/${fieldProps.type}/index.vue`);
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
                handler: props.handler,
            };

            /**
             * For types that recursively use dynamic fields, do not run handler
             * */
            if (props.handler && !RECURSIVE_TYPE.includes(res.type)) {
                const handlerRes = props.handler(Object.freeze(props));
                if (handlerRes.type) res.type = handlerRes.type;
                if (handlerRes.data) res.data = handlerRes.data;
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
            await loadComponent(props);
        });

        return {
            ...toRefs(state),
            proxy,
        };
    },
};
</script>
