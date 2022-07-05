<template>
    <div class="key-value-item">
        <div class="key-wrapper">
            {{ item.key }}
        </div>
        <div v-if="item.value" class="value-wrapper">
            {{ item.value }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';


interface KeyValueItem {
    key: string;
    value?: any;
}
interface Props {
    item: KeyValueItem;
}

export default defineComponent<Props>({
    name: 'KeyValueItem',
    components: {
    },
    props: {
        item: {
            type: Object,
            default: () => ({}) as PropType<KeyValueItem>,
        },
    },
});

</script>

<style lang="postcss" scoped>
.key-value-item {
    display: inline-flex;
    align-items: center;
    margin-right: 0.625rem;
    margin-bottom: 0.625rem;
    .key-wrapper {
        @apply bg-primary-4 border border-primary-3;
        padding: 0.5rem 0.75rem;
    }
    .value-wrapper {
        @apply bg-white border border-l-0 border-primary-3 truncate;
        max-width: 24rem;
        padding: 0.5rem 0.75rem;
    }
}
</style>
