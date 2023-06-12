<template>
    <component :is="state.component"
               :index="index"
               :name="name"
               :schema-options="schemaOptions"
               :data="data"
               :loading="loading"
               :view-options="viewOptions"
               :field-handler="fieldHandler"
               class="p-dynamic-widget"
    />
</template>

<script setup lang="ts">
import {
    defineAsyncComponent,
    reactive, watch,
} from 'vue';

import type {
    DynamicWidgetProps, DynamicWidgetType,
} from '@/data-display/dynamic/dynamic-widget/type';
import {
    DYNAMIC_WIDGET_TYPE,
} from '@/data-display/dynamic/dynamic-widget/type';

// TODO: this (any) must be refactored
const componentMap: Record<DynamicWidgetType, any> = {
    summary: {
        component: defineAsyncComponent(() => import('./templates/summary/index.vue')),
    },
    chart: {
        component: defineAsyncComponent(() => import('./templates/chart/index.vue')),
    },
};

const props = withDefaults(defineProps<DynamicWidgetProps>(), {
    index: 0,
    name: '',
    schemaOptions: () => ({}),
    loading: false,
    viewOptions: () => ({}),
});

// TODO: this (any) must be refactored
const state = reactive({
    component: null as null|any,
});

const getComponent = async () => {
    try {
        if (!DYNAMIC_WIDGET_TYPE.includes(props.type)) {
            throw new Error(`[Dynamic Widget] Unacceptable widget type: widget type must be one of ${DYNAMIC_WIDGET_TYPE}. ${props.type} is not acceptable.`);
        }

        state.component = componentMap[props.type];
    } catch (e) {
        console.error(e);
        state.component = null;
    }
};

watch(() => props.type, (aft, bef) => {
    if (aft !== bef) {
        getComponent();
    }
}, { immediate: true });

</script>

<style lang="postcss">
.p-dynamic-widget {
    @apply overflow-hidden;
}
</style>
