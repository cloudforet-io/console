<template>
    <div class="p-tab">
        <ul class="tab-item-wrapper" :class="{stretch}">
            <li v-for="(tab, idx) in tabItems" :key="tab.name"
                :class="{active: activeTab === tab.name, single: isSingle}"
                @click="onClickTab(tab, idx)"
            >
                <span class="label">
                    {{ tab.label }}
                    <slot name="extra" />
                </span>
            </li>
        </ul>
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
import {
    computed, defineComponent,
    toRefs,
} from '@vue/composition-api';

import { TabProps, useTab } from '@/hooks/tab';

interface Props extends TabProps {
    stretch?: boolean;
}

export default defineComponent<Props>({
    name: 'PTab',
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
            required: true,
        },
        /* tab props */
        stretch: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, context) {
        const { state, onClickTab } = useTab(props, context);
        const isSingle = computed(() => props.tabs.length === 1);
        return {
            ...toRefs(state),
            onClickTab,
            isSingle,
        };
    },
});
</script>

<style lang="postcss">
.p-tab {
    @apply rounded-sm border border-gray-200 bg-white;
    min-height: 19rem;
    ul.tab-item-wrapper {
        @apply border-gray-100;
        display: flex;
        flex-wrap: wrap;
        border-bottom-width: 4px;
        li {
            @apply text-gray-400;
            display: flex;
            min-height: 2.25rem;
            font-weight: bold;
            font-size: 0.875rem;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            margin-bottom: -4px;
            border-bottom-width: 4px;
            border-color: transparent;
            &:hover {
                @apply text-gray-900;
            }
            &.active {
                @apply text-primary;

                &:not(.single) {
                    @apply border-primary;
                }
            }
            .label {
                @apply w-full;
                display: flex;
                padding: 0.6rem 1rem;
                line-height: 150%;
            }
        }
        &.stretch {
            flex-wrap: nowrap;
            justify-content: space-around;
            li {
                flex-grow: 1;
                flex-shrink: 0;
            }
            .label {
                display: inline-flex;
                justify-content: center;
            }
        }
    }

    .tab-pane {
        @apply w-full pb-8;
    }
}
</style>
