<template>
    <div class="lnb-menu-list">
        <div v-for="(item, idx) in processedMenuData"
             :key="item.id"
             class="lnb-menu-item"
        >
            <p v-if="item.type === MENU_ITEM_TYPE.TITLE"
               class="title-wrapper"
            >
                <span v-if="item.foldable"
                      class="title foldable"
                      @click="handleFoldableToggle"
                >{{ item.label }}</span>
                <span v-else
                      class="title"
                >{{ item.label }}</span>
                <slot name="title-right"
                      v-bind="$props"
                />
                <new-mark v-if="item.isNew" />
                <beta-mark v-if="item.isBeta" />
                <span v-if="item.foldable"
                      class="toggle-button"
                      @click="handleFoldableToggle"
                >
                    <p-i width="1rem"
                         height="1rem"
                         :name="isFolded ? 'ic_chevron-up' : 'ic_chevron-down'"
                         color="inherit transparent"
                    />
                </span>
            </p>
            <p v-if="item.type === MENU_ITEM_TYPE.TOP_TITLE"
               class="top-title-wrapper"
            >
                <span class="top-title">{{ item.label }}</span>
            </p>

            <l-n-b-divider-menu-item v-if="item.type === MENU_ITEM_TYPE.DIVIDER && showMenu" />
            <l-n-b-router-menu-item v-if="item.type === MENU_ITEM_TYPE.ITEM && showMenu"
                                    :item="item"
                                    :depth="depth"
                                    :is-domain-owner="isDomainOwner"
                                    :idx="idx"
                                    :current-path="currentPath"
            >
                <template v-for="(_, slot) of $scopedSlots"
                          #[slot]="scope"
                >
                    <slot :name="slot"
                          v-bind="scope"
                    />
                </template>
            </l-n-b-router-menu-item>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

interface Props {
    menuData: LNBMenu;
    currentPath: string;
}

export default defineComponent<Props>({
    name: 'LNBMenuItem',
    components: {
        PI,
        BetaMark,
        NewMark,
        LNBRouterMenuItem,
        LNBDividerMenuItem,
    },
    props: {
        menuData: {
            type: [Object, Array] as PropType<LNBMenu>,
            default: () => ({}),
        },
        currentPath: {
            type: String,
            default: undefined,
        },
        depth: {
            type: Number,
            default: 1,
        },
    },

    setup(props) {
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            processedMenuData: computed<LNBMenu>(() => (Array.isArray(props.menuData) ? props.menuData : [props.menuData])),
            isFolded: false,
            isFoldableMenu: computed(() => state.processedMenuData?.some((item) => item.foldable)),
            showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
            hoveredItem: '',
        });

        const handleFoldableToggle = () => {
            state.isFolded = !state.isFolded;
        };

        const isSelectedMenu = (selectedMenuRoute: Location): boolean => {
            let currentPath = props.currentPath;
            if (!currentPath) return false;

            const resolved = SpaceRouter.router.resolve(selectedMenuRoute);
            if (!resolved) return false;

            if (currentPath.indexOf('?') > 0) {
                currentPath = currentPath.slice(0, currentPath.indexOf('?'));
            }
            let resolvedHref = resolved.href;
            if (!currentPath.endsWith('/')) currentPath += '/';
            if (!resolvedHref.endsWith('/')) resolvedHref += '/';
            return currentPath.startsWith(resolvedHref);
        };

        const getIsHovered = (itemId: string) => state.hoveredItem && state.hoveredItem === itemId;

        return {
            ...toRefs(state),
            handleFoldableToggle,
            isSelectedMenu,
            FAVORITE_TYPE,
            MENU_ITEM_TYPE,
            getIsHovered,
        };
    },
});
</script>

<style lang="postcss" scoped>
.lnb-menu-item {
    .title-wrapper {
        @apply text-gray-400 font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-left: 0.5rem;
        height: 2rem;
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
    .top-title-wrapper {
        @apply font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-top: 1.25rem;
        padding-left: 0.5rem;
        padding-bottom: 0.75rem;
    }
    .menu-item {
        @apply border border-transparent inline-flex items-center w-full h-full justify-between;
        font-size: 0.875rem;
        line-height: 125%;
        border-radius: 4px;
        box-sizing: border-box;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        outline: 0;
        height: 2rem;

        &.second-depth {
            padding-left: 1.25rem;
        }
        &:focus, &:focus-within, &:active {
            @apply bg-white border-secondary1;
            box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
        }
        &.selected {
            @apply bg-blue-200;
        }
        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }
        .text-wrapper {
            @apply inline-flex overflow-hidden whitespace-no-wrap;
            .text {
                @apply overflow-hidden whitespace-no-wrap;
                text-overflow: ellipsis;
            }
            .icon {
                flex-shrink: 0;
                margin-right: 0.25rem;
            }
        }
        .favorite-button {
            flex-shrink: 0;
            margin-left: 0.25rem;
        }
    }
    .divider {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
        height: 0;
    }
}
</style>
