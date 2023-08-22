<template>
    <component :is="state.component"
               :name="name"
               :options="options"
               :data="data"
               :fetch-options="fetchOptions"
               :type-options="typeOptions"
               :field-handler="fieldHandler"
               v-on="listeners"
    >
        <template v-for="(_, slot) of slots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
    </component>
</template>

<script setup lang="ts">
import { isEqual } from 'lodash';
import {
    defineAsyncComponent,
    onMounted, reactive, useAttrs, useSlots, watch,
} from 'vue';


import type { DynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayoutType } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { dynamicLayoutTypes } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

// TODO: this (any) must be refactored
const componentMap: Record<DynamicLayoutType, any> = {
    item: defineAsyncComponent(() => import('./templates/item/index.vue')),
    'simple-table': defineAsyncComponent(() => import('./templates/simple-table/index.vue')),
    table: defineAsyncComponent(() => import('./templates/table/index.vue')),
    'query-search-table': defineAsyncComponent(() => import('./templates/query-search-table/index.vue')),
    raw: defineAsyncComponent(() => import('./templates/raw/index.vue')),
    markdown: defineAsyncComponent(() => import('./templates/markdown/index.vue')),
    list: defineAsyncComponent(() => import('./templates/list/index.vue')),
    'raw-table': defineAsyncComponent(() => import('./templates/raw-table/index.vue')),
    html: defineAsyncComponent(() => import('./templates/html/index.vue')),
    popup: defineAsyncComponent(() => import('./templates/popup/index.vue')),
};

const props = withDefaults(defineProps<DynamicLayoutProps>(), {
    name: '',
    type: 'item',
    options: () => ({}) as DynamicLayoutProps['options'],
});
const attrs = useAttrs();
const slots = useSlots();

// TODO: this (any) must be refactored
const state = reactive({
    component: null as null|any,
});

const getComponent = async () => {
    try {
        if (!dynamicLayoutTypes.includes(props.type)) throw new Error(`[DynamicLayout] Unacceptable Type: layout type must be one of ${dynamicLayoutTypes}. ${props.type} is not acceptable.`);

        state.component = componentMap[props.type];
    } catch (e) {
        console.error(e);
        state.component = componentMap.item;
    }
};

const listeners = {
    ...attrs,
};

watch([() => props.type, () => props.name], (aft, bef) => {
    if (!isEqual(aft, bef)) {
        getComponent();
    }
}, { immediate: false });

onMounted(async () => {
    await getComponent();
});

</script>
