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
import { computed } from '@vue/composition-api';
import { TabItem } from '@/components/molecules/tabs/tab-bar/toolset';

export const tabBarProps = {
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
        },
    },
};


export const tabData = props => computed<TabItem[]>(() => props.tabs.map((value: string|TabItem) => {
    if (typeof value === 'string') {
        return { name: value, label: value };
    }
    value.label = value.label || value.name;
    return value;
}));
export const isOne = props => computed(() => props.tabs.length === 1);

export const tabClick = (props, emit) => (name) => {
    if (props.activeTab !== name) {
        emit('update:activeTab', name);
        emit('changeTab', name);
    }
};

export const isActive = props => name => props.activeTab === name;

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
        min-width: 5rem;
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
