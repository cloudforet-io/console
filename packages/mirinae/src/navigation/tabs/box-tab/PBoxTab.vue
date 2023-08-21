<template>
    <div class="p-box-tab"
         :class="styleType"
    >
        <div class="box-group">
            <button v-for="(tab, idx) in tabItems"
                    :key="tab.name"
                    :class="{ active: activeTab && activeTab === tab.name}"
                    @click="handleClickTab(tab, idx)"
            >
                <p-i v-show="activeTab && activeTab === tab.name"
                     name="ic_check"
                     color="inherit"
                />
                <span>{{ tab.label }}</span>
            </button>
        </div>
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

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';

import PI from '@/foundation/icons/PI.vue';
import { useTab } from '@/hooks/tab';
import { BOX_TAB_STYLE_TYPE } from '@/navigation/tabs/box-tab/config';
import type { TabItem } from '@/navigation/tabs/tab/type';

const props = defineProps({
    /* tab item props */
    tabs: {
        type: Array as PropType<(TabItem|string)[]>,
        default: () => [],
    },
    activeTab: {
        type: String,
        default: '',
    },
    /* box tab props */
    styleType: {
        type: String,
        default: BOX_TAB_STYLE_TYPE.white,
        validator(styleType: any) {
            return Object.values(BOX_TAB_STYLE_TYPE).includes(styleType);
        },
    },
});
const emit = defineEmits(['update:active-tab', 'change']);

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

</script>

<style lang="postcss">
.p-box-tab {
    $button-margin: 0.125rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    .box-group {
        display: flex;
        flex: 1;
        justify-content: space-evenly;
        width: calc(100% + $button-margin + $button-margin);
        margin: -$button-margin;
        button {
            @apply text-gray-500 border rounded-sm;
            display: flex;
            line-height: 1.6;
            font-size: 0.875rem;
            font-weight: bold;
            cursor: pointer;
            white-space: nowrap;
            padding: 1rem;
            max-height: 3.375rem;
            align-items: center;
            justify-content: center;
            margin: $button-margin;
            width: 100%;
            flex: 1;
            vertical-align: middle;

            @media (hover: hover) {
                &:hover:not(.active) {
                    @apply bg-blue-100 text-indigo-400;
                }
            }
        }
    }
    .tab-pane {
        margin-top: 1.5rem;
        flex-grow: 1;
        flex-shrink: 0;
    }

    /* style type */
    @define-mixin button-style $bg-color, $border-color {
        .box-group {
            button {
                background-color: $bg-color;
                border-color: $border-color;
                &.active {
                    @apply bg-primary1 border-primary1 text-white;
                }
            }
        }
    }

    &.white { @mixin button-style theme('colors.white'), theme('colors.gray.200'); }
    &.gray { @mixin button-style theme('colors.gray.100'), theme('colors.gray.100'); }
}
</style>
