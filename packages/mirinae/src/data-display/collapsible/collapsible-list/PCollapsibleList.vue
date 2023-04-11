<template>
    <div class="p-collapsible-list"
         :class="theme"
    >
        <div v-for="(item, idx) in collapsibleItems"
             :key="`${contextKey}-${item.name || idx}`"
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
                              isCollapsed: !proxyUnfoldedIndices.includes(idx)
                          }"
                    >{{ item.title }}</slot>
                </span>
                <p-collapsible-toggle v-if="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.title"
                                      :is-collapsed="!proxyUnfoldedIndices.includes(idx)"
                                      :toggle-type="toggleType"
                                      @update:isCollapsed="onUpdateCollapsed(idx, ...arguments)"
                />
            </p>
            <p-collapsible-panel v-show="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents || proxyUnfoldedIndices.includes(idx)"
                                 :is-collapsed="!proxyUnfoldedIndices.includes(idx)"
                                 :line-clamp="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents ? lineClamp : -1"
                                 @update:isCollapsed="onUpdateCollapsed(idx, ...arguments)"
            >
                <slot v-bind="{
                    data: item.data,
                    title: item.title,
                    name: item.name,
                    index: idx,
                    isCollapsed: !proxyUnfoldedIndices.includes(idx)
                }"
                >
                    {{ item.data }}
                </slot>
            </p-collapsible-panel>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import type { CollapsibleItem, CollapsibleListProps } from '@/data-display/collapsible/collapsible-list/type';
import PCollapsiblePanel from '@/data-display/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PCollapsibleToggle from '@/data-display/collapsible/collapsible-toggle/PCollapsibleToggle.vue';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';
import { useProxyValue } from '@/hooks';

export default defineComponent<CollapsibleListProps>({
    name: 'PCollapsibleList',
    components: { PCollapsiblePanel, PCollapsibleToggle },
    model: {
        prop: 'unfoldedIndices',
        event: 'update:unfoldedIndices',
    },
    props: {
        items: {
            type: Array,
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
    },
    setup(props, { emit }) {
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
        return {
            ...toRefs(state),
            onUpdateCollapsed,
            COLLAPSIBLE_LIST_TOGGLE_POSITION,
        };
    },
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
        padding: 0 0 1rem 0;
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
