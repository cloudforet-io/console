<template>
    <div class="p-dynamic-chart-column">
        p-dynamic-chart-column
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'PDynamicChartColumn',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>
