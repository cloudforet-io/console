<template>
    <div class="p-dynamic-widget-summary">
        <span class="name">
            {{ name }}
        </span>
        <span class="value">
            <p-skeleton v-if="loading"
                        height="1.75rem"
            />
            <p-dynamic-field v-else
                             :type="state.valueOptions.type"
                             :data="state.value"
                             :options="state.valueOptions.options"
                             :extra-data="state.valueOptions"
                             :handler="fieldHandler"
            />
        </span>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { DEFAULT_VALUE_OPTIONS } from '@/data-display/dynamic/dynamic-widget/config';
import type { DynamicWidgetProps } from '@/data-display/dynamic/dynamic-widget/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

type DynamicWidgetSummaryProps = Omit<DynamicWidgetProps, 'type' | 'index'>;

const props = withDefaults(defineProps<DynamicWidgetSummaryProps>(), {
    name: '',
    schemaOptions: () => ({}),
    loading: false,
    viewOptions: () => ({}),
});

const state = reactive({
    valueOptions: computed(() => props.schemaOptions?.value_options ?? DEFAULT_VALUE_OPTIONS),
    value: computed(() => {
        let value = getValueByPath(props.data, state.valueOptions.key);
        if (Array.isArray(value)) value = value[0];
        return value ?? '-';
    }),
});

</script>

<style lang="postcss">
.p-dynamic-widget-summary {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    min-width: inherit;
    min-height: 3rem;
    > .name {
        @apply text-gray-900;
        line-height: 1.125rem;
        font-size: 0.875rem;
        margin-bottom: 0.125rem;
    }
    > .value {
        display: inline-flex;
        font-size: 1.125rem;
        font-weight: bold;
        line-height: 1.75rem;
        .p-skeleton {
            min-width: 40px;
        }
    }
}
</style>
