<template>
    <div class="p-collapsible-list" :class="theme">
        <div v-for="(item, idx) in collapsibleItems" :key="`${contextKey}-${idx}`"
             class="collapsible-item"
        >
            <p class="top-wrapper">
                <span class="title">
                    <slot name="title"
                          v-bind="{
                              data: item.data,
                              title: item.title,
                              index: idx,
                              isCollapsed: !proxyUnfoldedIndices.includes(idx)
                          }"
                    >{{ item.title }}</slot>
                </span>
                <p-collapsible-toggle v-if="togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.title || lineClamp === 0"
                                      :is-collapsed="!proxyUnfoldedIndices.includes(idx)"
                                      @update:isCollapsed="onUpdateCollapsed(idx, ...arguments)"
                />
            </p>
            <div v-if="proxyUnfoldedIndices.includes(idx) ||
                     (togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents && lineClamp > 0)"
                 class="contents"
                 :class="{collapsed: !proxyUnfoldedIndices.includes(idx)}"
                 :style="{'-webkit-line-clamp': lineClamp}"
            >
                <slot v-bind="{
                    data: item.data,
                    title: item.title,
                    index: idx,
                    isCollapsed: !proxyUnfoldedIndices.includes(idx)
                }"
                >
                    {{ item.data }}
                </slot>
            </div>
            <div class="toggle-wrapper">
                <p-collapsible-toggle v-if="lineClamp > 0 && togglePosition === COLLAPSIBLE_LIST_TOGGLE_POSITION.contents"
                                      :is-collapsed="!proxyUnfoldedIndices.includes(idx)"
                                      @update:isCollapsed="onUpdateCollapsed(idx, ...arguments)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed,
    defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PCollapsibleToggle from '@/inputs/buttons/collapsible-toggle/PCollapsibleToggle.vue';
import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsibles/collapsible-list/config';
import { makeOptionalProxy } from '@/util/composition-helpers';

interface CollapsibleItem {
    title?: string;
    data: string;
}

interface Props {
    items: Array<CollapsibleItem|string>;
    unfoldedIndices?: number[];
    lineClamp?: number;
    multiUnfoldable?: boolean;
    togglePosition?: togglePosition;
    theme?: COLLAPSIBLE_LIST_THEME;
}
export default defineComponent<Props>({
    name: 'PCollapsibleList',
    components: { PCollapsibleToggle },
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
        theme: {
            type: String,
            default: COLLAPSIBLE_LIST_THEME.plain,
            validator(theme: any) {
                return Object.values(COLLAPSIBLE_LIST_THEME).includes(theme);
            },
        },
    },
    setup(props: Props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyUnfoldedIndices: makeOptionalProxy<number[]>('unfoldedIndices', vm, props.unfoldedIndices || []),
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

            const foundIdx = state.proxyUnfoldedIndices.findIndex(d => d === idx);
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
    .contents {
        font-size: 0.75rem;
        line-height: 1.5;
        word-break: break-word;
        margin-bottom: 0.5rem;
        &.collapsed {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    .toggle-wrapper {
        display: flex;
        justify-content: flex-end;
        .p-collapsible-toggle {
            flex-shrink: 0;
        }
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
