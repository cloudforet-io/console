<template>
    <div class="p-dynamic-widget-card">
        Card
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs,
} from '@vue/composition-api';
import { DynamicWidgetProps } from '@/data-display/dynamic/dynamic-widget/type';

export default defineComponent<DynamicWidgetProps>({
    name: 'PDynamicWidgetCard',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
</script>
