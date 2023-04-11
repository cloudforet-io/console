<template>
    <span>
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
                   :options="proxyOptions"
                   :data="proxyData"
                   :type-options="proxyTypeOptions"
                   :extra-data="proxyExtraData"
                   :handler="proxyHandler"
                   v-on="$listeners"
        />
    </span>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs, watch,
} from 'vue';
import type { PropType, AsyncComponent } from 'vue';
import type { ImportedComponent } from 'vue/types/options';

import type { DynamicFieldProps, DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicFieldType } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTextList from '@/data-display/text-list/PTextList.vue';

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
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props: DynamicFieldProps) {
        const state = reactive({
            component: null as null|AsyncComponent,
            proxyType: props.type,
            proxyOptions: props.options,
            proxyData: props.data,
            proxyTypeOptions: props.typeOptions,
            proxyExtraData: props.extraData,
            proxyHandler: props.handler as DynamicFieldHandler|undefined,
        });


        const loadComponent = (type: string) => {
            try {
                if (!dynamicFieldTypes.includes(type)) {
                    throw new Error(`[DynamicField] Unacceptable Type:
                                    field type must be one of ${dynamicFieldTypes}.
                                    ${type} is not acceptable.`);
                }

                state.component = componentMap[type];
            } catch (e) {
                console.error(e);
                state.component = componentMap.text;
            }
        };


        watch([
            () => props.type,
            () => props.handler,
            () => props.options,
            () => props.data,
            () => props.typeOptions,
            () => props.extraData,
        ], async ([type, handler]) => {
            if (RECURSIVE_TYPE.includes(type)) {
                // for types that recursively use dynamic fields, do not run handler and just pass the handler
                state.proxyHandler = handler;
            } else if (handler) {
                const handlerRes = handler(Object.freeze(props));
                // update proxy states by handler return value
                if (handlerRes.type !== undefined) state.proxyType = handlerRes.type;
                if (handlerRes.data !== undefined) state.proxyData = handlerRes.data;
                if (typeof handlerRes.handler === 'function') state.proxyHandler = handlerRes.handler;
                if (typeof handlerRes.options === 'object') state.proxyOptions = { ...props.options, ...handlerRes.options };
                if (typeof handlerRes.typeOptions === 'object') state.proxyTypeOptions = { ...props.typeOptions, ...handlerRes.typeOptions };
                if (typeof handlerRes.extraData === 'object') state.proxyExtraData = { ...props.extraData, ...handlerRes.extraData };

                // for types that recursively use dynamic fields, do not inherit handler.
                if (state.proxyType !== type && RECURSIVE_TYPE.includes(state.proxyType)) state.proxyHandler = undefined;
            }

            loadComponent(state.proxyType);
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
});
</script>
