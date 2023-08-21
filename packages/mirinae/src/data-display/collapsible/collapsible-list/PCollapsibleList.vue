<template>
    <div class="p-collapsible-list"
         :class="theme"
    >
        <div v-for="(item, idx) in state.collapsibleItems"
             :key="`${state.contextKey}-${item.name || idx}`"
             class="collapsible-item"
        >
            <p class="top-wrapper">
                <span class="title">
                    <slot name="title"
                          v-bind="{
                              data: item.data,
                              title: item.title,
                              name: item.name,
                              index: idx,
                              isCollapsed: !state.proxyUnfoldedIndices.includes(idx)
                          }"
                    >{{ item.title }}</slot>
                </span>
                <p-collapsible-toggle v-if="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.title"
                                      :is-collapsed="!state.proxyUnfoldedIndices.includes(idx)"
                                      :toggle-type="toggleType"
                                      @update:is-collapsed="onUpdateCollapsed(idx, $event)"
                />
            </p>
            <p-collapsible-panel v-show="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents || state.proxyUnfoldedIndices.includes(idx)"
                                 :is-collapsed="!state.proxyUnfoldedIndices.includes(idx)"
                                 :line-clamp="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents ? lineClamp : -1"
                                 @update:is-collapsed="onUpdateCollapsed(idx, $event)"
            >
                <slot v-bind="{
                    data: item.data,
                    title: item.title,
                    name: item.name,
                    index: idx,
                    isCollapsed: !state.proxyUnfoldedIndices.includes(idx)
                }"
                >
                    {{ item.data }}
                </slot>
            </p-collapsible-panel>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';

import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import type { CollapsibleItem } from '@/data-display/collapsible/collapsible-list/type';
import PCollapsiblePanel from '@/data-display/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';
import { useProxyValue } from '@/hooks';

const props = defineProps({
    items: {
        type: Array as PropType<(CollapsibleItem|string)[]>,
        default: () => [],
    },
    unfoldedIndices: {
        type: Array,
        default: () => [],
    },
    lineClamp: {
        type: Number,
        default: 2,
    },
    multiUnfoldable: {
        type: Boolean,
        default: false,
    },
    togglePosition: {
        type: String,
        default: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
        validator(position: any) {
            return Object.values(COLLAPSIBLE_LIST_TOGGLE_POSITION).includes(position);
        },
    },
    toggleType: {
        type: String,
        default: COLLAPSIBLE_TOGGLE_TYPE.text,
        validator(type: any) {
            return Object.values(COLLAPSIBLE_TOGGLE_TYPE).includes(type);
        },
    },
    theme: {
        type: String,
        default: COLLAPSIBLE_LIST_THEME.plain,
        validator(theme: any) {
            return Object.values(COLLAPSIBLE_LIST_THEME).includes(theme);
        },
    },
});

const emit = defineEmits(['update:unfolded-indices']);
const state = reactive({
    proxyUnfoldedIndices: useProxyValue<number[]>('unfoldedIndices', props, emit),
    collapsibleItems: computed<CollapsibleItem[]>(() => props.items.map((d) => {
        if (typeof d === 'string') return { data: d };
        return d;
    })),
    contextKey: Math.floor(Math.random() * Date.now()),
});

const onUpdateCollapsed = (idx: number, isCollapsed: boolean) => {
    if (!props.multiUnfoldable) {
        if (isCollapsed) state.proxyUnfoldedIndices = [];
        else state.proxyUnfoldedIndices = [idx];
        return;
    }

    const foundIdx = state.proxyUnfoldedIndices.findIndex((d) => d === idx);
    if (isCollapsed) {
        if (foundIdx !== -1) {
            const newIndices = [...state.proxyUnfoldedIndices];
            newIndices.splice(foundIdx, 1);
            state.proxyUnfoldedIndices = newIndices;
        }
    } else if (foundIdx === -1) {
        state.proxyUnfoldedIndices.push(idx);
    }
};

watch(() => props.items, (after, before) => {
    if (after !== before) state.contextKey = Math.floor(Math.random() * Date.now());
});

</script>

<style lang="postcss">
.p-collapsible-list {
    @apply rounded-lg;
    .collapsible-item {
        padding: 0 1rem;
        &:first-of-type {
            @apply rounded-t-lg;
        }
        &:last-of-type {
            @apply rounded-b-lg;
        }
    }
    .top-wrapper {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        .title {
            flex-grow: 1;
            flex-shrink: 0;
            font-size: 1rem;
            line-height: 1.25;
        }
    }
    .p-collapsible-panel {
        padding: 0 0 1rem;
    }

    &.card {
        @apply border border-gray-300;
        .collapsible-item {
            @apply border-b border-gray-300;
            &:last-of-type {
                @apply border-b-0;
            }
        }
    }
}
</style>
