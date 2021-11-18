<template>
    <div class="budget-list-card">
        test
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'BudgetListCard',
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-list-card {
    @apply text-secondary;
}
</style>
