<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PCheckbox, PI, PTextHighlighting, getTextHighlightRegex,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    item: DataTableFieldType;
    value: string[];
    searchText: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:value', value: string[]): void;
}>();

const state = reactive({
    regex: computed(() => getTextHighlightRegex(props.searchText)),
    proxyValue: useProxyValue('value', props, emit),
});

</script>

<template>
    <span v-show="state.regex.test(props.item.label ?? props.item.name)"
          :key="props.item.name"
          class="column-item"
          :class="{'draggable-item' :(state.proxyValue ?? []).includes(props.item.name)}"
    >
        <p-checkbox v-model="state.proxyValue"
                    :value="props.item.name"
        >
            <p-text-highlighting :text="props.item.label ?? props.item.name"
                                 :term="searchText"
                                 style-type="secondary"
            />
        </p-checkbox>
        <p-i name="ic_drag-handle-alt"
             width="1rem"
             height="1rem"
             class="drag-icon"
        />

    </span>
</template>

<style lang="postcss" scoped>
.column-item {
    display: flex;
    width: 100%;
    align-items: center;
    cursor: pointer;
    padding: 0.375rem 0.5rem;

    @media (hover: hover) {
        &:hover {
            @apply bg-blue-200;
        }
    }

    /* custom design-system component - p-checkbox */
    .p-checkbox:deep() {
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
        .check-icon {
            margin-right: 0.25rem;
            flex-shrink: 0;
        }
        .text {
            > span {
                display: inline;
            }
        }
    }

    .drag-icon {
        flex-shrink: 0;
        display: none;
    }

    &.draggable-item {
        .drag-icon {
            display: inline-block;
        }
    }
    &.ghost {
        @apply border border-secondary;
        opacity: 0.5;
    }
}
</style>
