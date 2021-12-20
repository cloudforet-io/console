<template>
    <div class="p-dynamic-chart-donut">
        p-dynamic-chart-donut
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'PDynamicChartDonut',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>
