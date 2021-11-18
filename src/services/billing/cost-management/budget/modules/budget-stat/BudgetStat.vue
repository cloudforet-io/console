<template>
    <div />
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'BudgetStat',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>
