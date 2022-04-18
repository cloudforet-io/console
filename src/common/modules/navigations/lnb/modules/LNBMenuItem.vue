<template>
    <div>
        <div v-for="(item, idx) in menuData" :key="idx" class="menu-item-wrapper">
            <div v-if="item.type === 'title'">
                <p class="title-wrapper">
                    <span v-if="item.foldable" class="title foldable" @click="handleToggle">{{ item.label }}</span>
                    <span v-else class="title">{{ item.label }}</span>
                    <slot name="title-right" v-bind="$props" />
                    <new-mark v-if="item.isNew" />
                    <beta-mark v-if="item.isBeta" />
                    <span v-if="item.foldable" class="toggle-button">
                        <p-i width="1rem" height="1rem"
                             :name="isFolded ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                             color="inherit transparent"
                        />
                    </span>
                </p>
            </div>
            <div v-if="item.type === 'divider' && showMenu" class="divider">
                <p-divider />
            </div>
            <div v-if="item.type === 'item' && showMenu" @click="handleClick(item)">
                <router-link class="menu-item" :class="[{'second-depth': hasTopTitle}, {'selected': selectedItem.id === item.id}]"
                             :to="item.to"
                >
                    <slot name="before-text" v-bind="{...$props, item, index: idx}" />
                    {{ item.label }}
                    <slot name="after-text" v-bind="{...$props, item, index: idx}" />
                    <new-mark v-if="item.isNew" />
                    <beta-mark v-if="item.isBeta" />
                    <slot name="right-extra" v-bind="{...$props, item, index: idx}" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import NewMark from '@/common/components/marks/NewMark.vue';
import BetaMark from '@/common/components/marks/BetaMark.vue';
import { PDivider, PI } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { LNBItem } from '@/common/modules/navigations/lnb/type';

export default {
    name: 'LNBMenuItem',
    components: {
        PI, BetaMark, NewMark, PDivider,
    },
    props: {
        hasTopTitle: {
            type: Boolean,
            default: false,
        },
        menuData: {
            type: Array,
            default: () => [],
        },
        selectedItem: {
            type: Object as () => LNBItem,
            default: () => ({}),
        },
    },

    setup(props, { emit }) {
        const state = reactive({
            isFolded: false,
            isFoldableMenu: computed(() => props.menuData?.some(item => item.foldable)),
            showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
        });

        const handleToggle = () => {
            state.isFolded = !state.isFolded;
        };

        const handleClick = (item: LNBItem) => {
            emit('click-menu', item);
        };

        return {
            ...toRefs(state),
            handleToggle,
            handleClick,
        };
    },
};
</script>

<style lang="postcss" scoped>
.menu-item-wrapper {
    .title-wrapper {
        @apply text-gray-400 font-bold inline-block;
        font-size: 0.75rem;
        line-height: 125%;
        margin-bottom: 0.5rem;

        .title {
            &.foldable {
                &:hover {
                    @apply text-gray-800 cursor-pointer underline;
                }
            }
        }

        .toggle-button {
            &:hover {
                @apply text-gray-800 cursor-pointer;
            }
        }
    }
    .menu-item {
        @apply flex items-center;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 125%;
        border-radius: 4px;
        box-sizing: border-box;

        &.second-depth {
            padding-left: 1.25rem;
        }

        &.selected {
            @apply bg-blue-200;
        }

        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }

        &:focus, &:active {
            box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
        }
    }
    .divider {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
    }
}
</style>
