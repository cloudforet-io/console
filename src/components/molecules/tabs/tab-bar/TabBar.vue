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
import {TabItem} from "@/components/molecules/tabs/tab-bar/toolset";

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
    @apply flex flex-wrap pl-0 mb-0;
    > li {
        cursor: pointer;
    }
    .p-nav-link {
        @apply flex no-underline border border-gray3 bg-white;
        font: 14px/16px Arial;
        min-width: 7.5rem;
        min-height: 2rem;
        max-height: 2rem;
        border-radius: 2px 2px 0px 0px;
        text-align: center;
        margin-bottom: -1px;
        .label {
            line-height: 2rem;
            width: 100%;
        }
        &:hover {
            @apply text-secondary;
        }
        &.active {
            @apply text-primary;
            font-weight: bold;
            box-shadow: 0.25rem -0.25rem 0.75rem -0.25rem  #4D49B614,
                        -0.25rem -0.25rem 0.75rem -0.25rem #4D49B614;
            &:not(.one-tab) .label {
                @apply border-b-2 border-primary;
            }
            &.one-tab .label {
                @apply border-b-2 border-white;
            }
        }
        &:not(.active) {
            box-shadow: inset 0px -8px 8px -8px #4D49B614;
        }
    }
}
</style>
