<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI } from '@cloudforet/mirinae';

import type {
    DataTableOperator,
} from '@/common/modules/widgets/types/widget-model';


interface Props {
    operator: DataTableOperator;
}

const props = defineProps<Props>();

const state = reactive({
    operatorMap: computed(() => {
        if (props.operator === 'CONCAT') return { name: 'Concatenate', icon: 'ic_db-concat' };
        if (props.operator === 'JOIN') return { name: 'Join', icon: 'ic_join' };
        if (props.operator === 'QUERY') return { name: 'Query', icon: 'ic_db-where' };
        if (props.operator === 'EVAL') return { name: 'Evaluate', icon: 'ic_db-evaluation' };
        if (props.operator === 'PIVOT') return { name: 'Pivot', icon: '' }; // TODO: Add icon
        if (props.operator === 'VALUE_MAPPING') return { name: 'Value Mapping', icon: '' }; // TODO: Add icon
        if (props.operator === 'ADD_LABELS') return { name: 'Add Labels', icon: '' }; // TODO: Add icon
        return { name: '', icon: '' };
    }),
});

</script>

<template>
    <div class="widget-form-data-table-card-transform-form">
        <div class="data-table-select-form">
            <div class="operator">
                <p-i :name="state.operatorMap.icon"
                     width="1rem"
                     height="1rem"
                />
                <span>{{ state.operatorMap.name }}</span>
            </div>
            <slot name="default" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-form {
    padding: 0.75rem 1rem;

    .data-table-select-form {
        .operator {
            @apply inline-flex items-center gap-1 rounded-md border border-gray-150 bg-gray-100 text-label-sm font-bold text-gray-700;
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.5rem;
        }
    }
}
</style>
