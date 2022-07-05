<template>
    <fragment>
        <p-text-list v-if="type !== 'list' && Array.isArray(data)"
                     :items="data"
                     :delimiter="options.delimiter === undefined ? '<br>' : options.delimiter"
        >
            <template #default="{value}">
                <p-dynamic-field :options="options"
                                 :data="value"
                                 :type="type"
                                 :type-options="typeOptions"
                                 :extra-data="extraData"
                                 :handler="handler"
                                 v-on="$listeners"
                />
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
    computed, defineComponent, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import { AsyncComponent } from 'vue';
import { ImportedComponent } from 'vue/types/options';

import { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import { DynamicFieldType, dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTextList from '@/others/console/text-list/PTextList.vue';

const PDynamicField = () => ({
    // eslint-disable-next-line import/no-self-import
    component: import('./PDynamicField.vue'),
});

const RECURSIVE_TYPE = ['list', 'enum'];

const componentMap: Record<DynamicFieldType, AsyncComponent> = {
    text: () => ({
        component: import('./templates/text/index.vue') as Promise<ImportedComponent>,
    }),
    badge: () => ({
        component: import('./templates/badge/index.vue') as Promise<ImportedComponent>,
    }),
    datetime: () => ({
        component: import('./templates/datetime/index.vue') as Promise<ImportedComponent>,
    }),
    state: () => ({
        component: import('./templates/state/index.vue') as Promise<ImportedComponent>,
    }),
    enum: () => ({
        component: import('./templates/enum/index.vue') as Promise<ImportedComponent>,
    }),
    size: () => ({
        component: import('./templates/size/index.vue') as Promise<ImportedComponent>,
    }),
    dict: () => ({
        component: import('./templates/dict/index.vue') as Promise<ImportedComponent>,
    }),
    list: () => ({
        component: import('./templates/list/index.vue') as Promise<ImportedComponent>,
    }),
    more: () => ({
        component: import('./templates/more/index.vue') as Promise<ImportedComponent>,
    }),
};

export default defineComponent<DynamicFieldProps>({
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
    setup(props: DynamicFieldProps) {
        const state = reactive<any>({
            component: null as null|AsyncComponent,
            nextHandler: props.handler,
        });


        const loadComponent = async (fieldProps: DynamicFieldProps) => {
            try {
                if (!dynamicFieldTypes.includes(fieldProps.type)) {
                    throw new Error(`[DynamicField] Unacceptable Type:
                                    field type must be one of ${dynamicFieldTypes}.
                                    ${fieldProps.type} is not acceptable.`);
                }

                state.component = componentMap[fieldProps.type];
            } catch (e) {
                console.error(e);
                state.component = componentMap.text;
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
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
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
});
</script>
