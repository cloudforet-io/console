<template>
    <span>
        <p-text-list v-if="type !== 'list' && Array.isArray(data)"
                     :items="data"
                     :delimiter="typeof options.delimiter !== 'string' ? '<br>' : options.delimiter"
        >
            <template #default="{value}">
                <p-dynamic-field :options="options"
                                 :data="value"
                                 :type="type"
                                 :type-options="typeOptions"
                                 :extra-data="extraData"
                                 :handler="handler"
                                 v-on="listeners"
                />
            </template>
        </p-text-list>
        <component :is="state.component"
                   v-else
                   :options="state.proxyOptions"
                   :data="state.proxyData"
                   :type-options="state.proxyTypeOptions"
                   :extra-data="state.proxyExtraData"
                   :handler="state.proxyHandler"
                   v-on="listeners"
        />
    </span>
</template>

<script setup lang="ts">
import {
    defineAsyncComponent,
    reactive, useAttrs, watch,
} from 'vue';

import type { DynamicFieldProps, DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicFieldType } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTextList from '@/data-display/text-list/PTextList.vue';

const PDynamicField = () => ({
    // eslint-disable-next-line import/no-self-import
    component: import('./PDynamicField.vue'),
});

const RECURSIVE_TYPE = ['list', 'enum'];

// TODO: this (any) must be refactored
const componentMap: Record<DynamicFieldType, any> = {
    text: {
        component: defineAsyncComponent(() => import('./templates/text/index.vue')),
    },
    badge: {
        component: defineAsyncComponent(() => import('./templates/badge/index.vue')),
    },
    datetime: {
        component: defineAsyncComponent(() => import('./templates/datetime/index.vue')),
    },
    state: {
        component: defineAsyncComponent(() => import('./templates/state/index.vue')),
    },
    enum: {
        component: defineAsyncComponent(() => import('./templates/enum/index.vue')),
    },
    size: {
        component: defineAsyncComponent(() => import('./templates/size/index.vue')),
    },
    dict: {
        component: defineAsyncComponent(() => import('./templates/dict/index.vue')),
    },
    list: {
        component: defineAsyncComponent(() => import('./templates/list/index.vue')),
    },
    more: {
        component: defineAsyncComponent(() => import('./templates/more/index.vue')),
    },
};

const props = withDefaults(defineProps<DynamicFieldProps>(), {
    type: 'text',
    options: () => ({}),
    extraData: () => ({}),
    typeOptions: () => ({}),
});
const attrs = useAttrs();

// TODO: this (any) must be refactored
const state = reactive({
    component: null as null|any,
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

const listeners = {
    ...attrs,
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

</script>
