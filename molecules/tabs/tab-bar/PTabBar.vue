<template>
    <ul class="p-nav-tabs">
        <li
            v-for="tab in tabData"
            :key="tab.name"
            class="nav-item"
            @click="tabClick(tab.name)"
        >
            <a
                class="p-nav-link"
                :class="{active: activeTab === tab.name,
                         disabled: tab.disabled,
                         'one-tab':isOne }"
            >
                <span class="label">{{ tab.label }}</span>
            </a>
        </li>
    </ul>
</template>

<script lang="ts">
import {
    isActive, isOne, tabBarProps, tabClick, tabData,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';

export default {
    name: 'PTabBar',
    mixins: [tabBarProps],
    setup(props, { emit }) {
        return {
            tabData: tabData(props),
            isOne: isOne(props),
            tabClick: tabClick(props, emit),
            isActive: isActive(props),
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-nav-tabs {
    @apply flex flex-wrap pl-0 mb-0 ;
    > li {
        cursor: pointer;
    }
    .p-nav-link {
        @apply flex no-underline text-sm min-h-9;
        /* min-width: 5rem; */
        text-align: center;
        margin-bottom: -4px;
        .label {
            @apply px-4 w-full;
            padding-top: 0.59375rem;
            padding-bottom: 0.59375rem;
            line-height: 150%;
        }
        &:hover {
            @apply text-secondary;
        }
        &.active {
            @apply text-primary font-bold;
            font-weight: bold;
            &:not(.one-tab) {
                @apply border-b-4 border-primary;
            }
        }
        &:not(.active) {
            @apply text-gray-500;
        }
    }
}
</style>
