<template>
    <div class="p-tab">
        <ul class="tab-item-wrapper" :class="{stretch}">
            <li v-for="(tab, idx) in tabItems" :key="tab.name"
                :class="{active: activeTab === tab.name, single: tabs.length === 1}"
                @click="handleClickTab(tab, idx)"
            >
                <span class="label">
                    {{ tab.label }}
                </span>
                <span class="extra">
                    <slot name="extra" v-bind="tab" />
                </span>
            </li>
        </ul>
        <div class="tab-pane">
            <slot />
            <keep-alive>
                <slot v-if="keepAliveTabNames.includes(activeTab)" :name="activeTab" v-bind="currentTabItem" />
            </keep-alive>
            <slot v-if="nonKeepAliveTabNames.includes(activeTab)" :name="activeTab" v-bind="currentTabItem" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent,
} from '@vue/composition-api';

import { useTab } from '@/hooks/tab';
import { TabItem, TabProps } from '@/navigation/tabs/tab/type';


export default defineComponent<TabProps>({
    name: 'PTab',
    model: {
        prop: 'activeTab',
        event: 'update:active-tab',
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
    setup(props: TabProps, { emit }) {
        const {
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
        } = useTab({
            tabs: computed(() => props.tabs),
            activeTab: computed(() => props.activeTab),
        });

        /* event */
        const handleClickTab = (tab: TabItem, idx: number) => {
            if (props.activeTab !== tab.name) {
                emit('update:active-tab', tab.name);
                emit('change', tab.name, idx);
            }
        };

        return {
            tabItems,
            keepAliveTabNames,
            nonKeepAliveTabNames,
            currentTabItem,
            handleClickTab,
        };
    },
});
</script>

<style lang="postcss">
.p-tab {
    @apply rounded-lg border border-gray-200 bg-white;
    min-height: 19rem;
    ul.tab-item-wrapper {
        @apply border-gray-100;
        display: flex;
        flex-wrap: wrap;
        border-bottom-width: 4px;
        li {
            @apply text-gray-400;
            display: flex;
            align-items: center;
            min-height: 2.25rem;
            font-size: 0.875rem;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            margin-bottom: -4px;
            border-bottom-width: 4px;
            border-color: transparent;
            padding: 0 1rem;
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
                padding: 0.6rem 0;
                line-height: 150%;
                font-weight: bold;
            }
            .extra {
                margin-left: 0.25rem;
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
