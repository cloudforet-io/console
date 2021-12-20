<template>
    <div class="p-dynamic-chart-treemap">
        p-dynamic-chart-treemap
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'PDynamicChartTreemap',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>
