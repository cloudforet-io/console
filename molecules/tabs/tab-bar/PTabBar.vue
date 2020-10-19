<template>
    <ul class="p-nav-tabs">
        <li
            v-for="tab in tabData"
            :key="tab.name"
            class="nav-item"
            @click="onClickTab(tab.name)"
        >
            <a
                class="p-nav-link"
                :class="{active: activeTab === tab.name,
                         disabled: tab.disabled,
                         'single-tab':isSingle }"
            >
                <span class="label">
                    {{ tab.label }}
                    <slot name="beta">
                        <span v-if="tab.beta" class="beta-text">beta</span>
                    </slot>
                </span>
            </a>
        </li>
    </ul>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { TabBarProps, TabItem } from '@/components/molecules/tabs/tab-bar/type';

export default {
    name: 'PTabBar',
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
    },
    setup(props: TabBarProps, { emit }) {
        const state = reactive({
            tabData: computed(() => props.tabs.map((value: string|TabItem) => {
                if (typeof value === 'string') {
                    return { name: value, label: value };
                }
                value.label = value.label || value.name;
                return value;
            })),
            isSingle: computed(() => props.tabs.length === 1),
        });

        const onClickTab = (name) => {
            if (props.activeTab !== name) {
                emit('update:activeTab', name);
                emit('changeTab', name);
            }
        };
        return {
            ...toRefs(state),
            onClickTab,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-nav-tabs {
    @apply flex flex-wrap pl-0 mb-0 ;
    .nav-item {
        cursor: pointer;
    }
    .p-nav-link {
        @apply text-gray-400;
        display: flex;
        min-height: 2.25rem;
        font-weight: bold;
        font-size: 0.875rem;
        text-decoration: none;
        text-align: center;
        margin-bottom: -4px;
        &:hover {
            @apply text-gray-900;
        }
        &.active {
            @apply text-primary;
            &:not(.single-tab) {
                @apply border-b-4 border-primary;
            }
        }
        .label {
            @apply px-4 w-full;
            display: flex;
            padding-top: 0.59375rem;
            padding-bottom: 0.59375rem;
            line-height: 150%;
            .beta-text {
                @apply text-coral-500;
                font-size: 0.75rem;
                font-weight: normal;
                padding-left: 0.25rem;
                margin-top: -0.25rem;
            }
        }
    }
}
</style>
