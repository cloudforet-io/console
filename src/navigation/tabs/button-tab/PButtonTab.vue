<template>
    <div class="p-button-tab">
        <transition name="fade" mode="out-in">
            <div class="button-group">
                <button v-for="(tab, idx) in tabItems"
                        ref="buttonRefs"
                        :key="tab.name"
                        :class="{ active: activeTab === tab.name}"
                        @click="onClickTab(tab, idx)"
                        @keydown.left="focusButton(idx, -1)"
                        @keydown.right="focusButton(idx, 1)"
                >
                    {{ tab.label }}
                </button>
            </div>
        </transition>
        <div class="tab-pane">
            <slot />
            <keep-alive>
                <slot v-if="keepTabNames.includes(activeTab)" :name="activeTab" v-bind="currentTabItem" />
            </keep-alive>
            <slot v-if="nonKeepTabNames.includes(activeTab)" :name="activeTab" v-bind="currentTabItem" />
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref, toRefs } from '@vue/composition-api';
import { TabProps, useTab } from '@/hooks/tab';

interface Props extends TabProps {
    styleType?: string;
}

export default defineComponent<Props>({
    name: 'PButtonTab',
    model: {
        prop: 'activeTab',
        event: 'update:activeTab',
    },
    props: {
        /* tab item props */
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
        keepAliveAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, context) {
        const { state, onClickTab } = useTab(props, context);

        const buttonRefs = ref<HTMLElement[]|null>(null);

        const focusButton = (current: number, moveTo: 1|-1) => {
            if (!buttonRefs.value) return;
            let next = buttonRefs.value[current + moveTo];
            if (!next) {
                if (moveTo > 0) next = buttonRefs.value[0];
                else next = buttonRefs.value[buttonRefs.value.length - 1];
            }

            next.focus();
        };
        return {
            ...toRefs(state),
            onClickTab,
            buttonRefs,
            focusButton,
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
    .fade-enter, .fade-leave-to {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
