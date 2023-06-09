<template>
    <div class="p-tab">
        <ul class="tab-item-wrapper"
            :class="{stretch}"
        >
            <li v-for="(tab, idx) in tabItems"
                :key="tab.name"
                :class="{active: activeTab === tab.name}"
                role="tab"
                :tabindex="0"
                @keydown.enter="selectTab(tab, idx)"
                @click="selectTab(tab, idx)"
            >
                <span class="label">
                    {{ tab.label }}
                </span>
                <span class="extra">
                    <slot name="extra"
                          v-bind="tab"
                    />
                </span>
            </li>
        </ul>
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
        <div class="footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
} from 'vue';

import { useTab } from '@/hooks/tab';
import type { TabItem, TabProps } from '@/navigation/tabs/tab/type';

const props = withDefaults(defineProps<TabProps>(), {
    tabs: () => [],
    activeTab: '',
    stretch: false,
});
const emit = defineEmits(['update:activeTab', 'change']);

const {
    tabItems,
    keepAliveTabNames,
    nonKeepAliveTabNames,
    currentTabItem,
} = useTab({
    tabs: computed(() => props.tabs),
    activeTab: computed(() => props.activeTab),
});

const selectTab = (tab: TabItem, idx: number) => {
    if (props.activeTab !== tab.name) {
        emit('update:activeTab', tab.name);
        emit('change', tab.name, idx);
    }
};

</script>

<style lang="postcss">
.p-tab {
    @apply rounded-lg border border-gray-200 bg-white;
    min-height: 19rem;
    display: flex;
    flex-direction: column;
    ul.tab-item-wrapper {
        @apply border-gray-100;
        flex: 0 0;
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

            @media (hover: hover) {
                &:hover {
                    @apply text-gray-900;
                }
            }
            &.active {
                @apply text-primary border-primary;
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
        flex: 1 1;
    }
    .footer {
        flex: 0 0;
    }
}
</style>
