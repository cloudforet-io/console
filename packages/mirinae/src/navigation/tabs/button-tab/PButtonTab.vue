<template>
    <div class="p-button-tab">
        <transition name="fade"
                    mode="out-in"
        >
            <div class="button-group">
                <button v-for="(tab, idx) in tabItems"
                        ref="buttonRefs"
                        :key="tab.name"
                        :class="{ active: activeTab === tab.name}"
                        @click="handleClickTab(tab, idx)"
                        @keydown.left="handleKeydownLeft(idx)"
                        @keydown.right="handleKeydownRight(idx)"
                >
                    {{ tab.label }}
                </button>
            </div>
        </transition>
        <div class="tab-pane">
            <slot />
            <keep-alive>
                <slot v-if="keepAliveTabNames.includes(activeTab)"
                      :name="activeTab"
                      v-bind="currentTabItem"
                />
            </keep-alive>
            <slot v-if="nonKeepAliveTabNames.includes(activeTab)"
                  :name="activeTab"
                  v-bind="currentTabItem"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { useTab } from '@/hooks/tab';
import type { TabItem } from '@/navigation/tabs/tab/type';


export default defineComponent({
    name: 'PButtonTab',
    model: {
        prop: 'activeTab',
        event: 'update:activeTab',
    },
    props: {
        tabs: {
            // FIXME:: below any type
            type: Array as PropType<any>,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const {
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
        } = useTab({
            tabs: computed(() => props.tabs),
            activeTab: computed(() => props.activeTab),
        });

        const state = reactive({
            buttonRefs: null as HTMLElement[] | null,
        });

        /* event */
        const focusButton = (current: number, moveTo: 1|-1) => {
            if (!state.buttonRefs) return;
            let next = state.buttonRefs[current + moveTo];
            if (!next) {
                if (moveTo > 0) next = state.buttonRefs[0];
                else next = state.buttonRefs[state.buttonRefs.length - 1];
            }
            next.focus();
        };
        const handleClickTab = (tab: TabItem, idx: number) => {
            if (props.activeTab !== tab.name) {
                emit('update:activeTab', tab.name);
                emit('change', tab.name, idx);
            }
        };
        const handleKeydownLeft = (current: number) => {
            focusButton(current, -1);
        };
        const handleKeydownRight = (current: number) => {
            focusButton(current, 1);
        };

        return {
            ...toRefs(state),
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
            handleClickTab,
            handleKeydownLeft,
            handleKeydownRight,
        };
    },
});
</script>

<style lang="postcss">
.p-button-tab {
    .button-group {
        display: flex;
        flex-wrap: wrap;
        min-height: 2.5rem;
        margin: 0.75rem;
        button {
            @apply bg-gray-100 text-gray-900 border rounded-2xl;
            border-width: 1px;
            border-color: rgba(theme('colors.gray.400'), 0.7);
            min-height: 2rem;
            font-size: 0.875rem;
            line-height: 1.6;
            padding-left: 1rem;
            padding-right: 1rem;
            margin: 0.25rem;
            &:hover {
                @apply bg-gray-200;
            }
            &.active {
                @apply border-gray-700 bg-gray-700 text-white;
            }
        }
    }
    .tab-pane {
        width: 100%;
        padding-bottom: 2rem;
    }
    .fade-enter-active, .fade-leave-active {
        transition: visibility, opacity 0.2s;
    }
    .fade-enter-from, .fade-leave-to {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
