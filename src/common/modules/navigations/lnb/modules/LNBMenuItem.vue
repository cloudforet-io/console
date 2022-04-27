<template>
    <div class="lnb-menu-list">
        <div v-for="(item, idx) in processedMenuData" :key="item.id" class="lnb-menu-item">
            <p v-if="item.type === MENU_ITEM_TYPE.TITLE" class="title-wrapper">
                <span v-if="item.foldable" class="title foldable" @click="handleToggle">{{ item.label }}</span>
                <span v-else class="title">{{ item.label }}</span>
                <slot name="title-right" v-bind="$props" />
                <new-mark v-if="item.isNew" />
                <beta-mark v-if="item.isBeta" />
                <span v-if="item.foldable" class="toggle-button" @click="handleToggle">
                    <p-i width="1rem" height="1rem"
                         :name="isFolded ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                         color="inherit transparent"
                    />
                </span>
            </p>
            <div v-if="item.type === MENU_ITEM_TYPE.DIVIDER && showMenu" class="divider">
                <p-divider />
            </div>
            <router-link
                v-if="item.type === MENU_ITEM_TYPE.ITEM && showMenu" class="menu-item"
                :class="[{'second-depth': depth === 2}, {'selected': checkSelectedMenu(item.to)}]"
                :to="item.to"
                @click.native="$event.stopImmediatePropagation()"
                @mouseenter.native="hoveredItem = item.id"
                @mouseleave.native="hoveredItem = ''"
            >
                <slot name="before-text" v-bind="{...$props, item, index: idx}" />
                <div class="text-wrapper">
                    <span class="text">{{ item.label }}</span>
                    <slot name="after-text" v-bind="{...$props, item, index: idx}" />
                    <new-mark v-if="item.isNew" />
                    <beta-mark v-if="item.isBeta" />
                </div>
                <slot name="right-extra" v-bind="{...$props, item, index: idx}" />
                <favorite-button
                    v-if="!item.hideFavorite && !isDomainOwner"
                    :item-id="item.id"
                    :favorite-type="item.favoriteType ? item.favoriteType : FAVORITE_TYPE.MENU"
                    :visible-active-case-only="!getIsHovered(item.id)"
                    scale="0.8"
                    class="favorite-button"
                />
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import NewMark from '@/common/components/marks/NewMark.vue';
import BetaMark from '@/common/components/marks/BetaMark.vue';
import { PDivider, PI } from '@spaceone/design-system';
import {
    computed, defineComponent, PropType, reactive, toRefs,
} from '@vue/composition-api';
import { LNBMenu, MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';
import { Location } from 'vue-router';
import { isEqual } from 'lodash';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { store } from '@/store';

interface Props {
    menuData: LNBMenu;
    currentRoute: Location|undefined;
}

export default defineComponent<Props>({
    name: 'LNBMenuItem',
    components: {
        FavoriteButton,
        PI,
        BetaMark,
        NewMark,
        PDivider,
    },
    props: {
        menuData: {
            type: [Object, Array] as PropType<LNBMenu>,
        },
        currentRoute: {
            type: Object as PropType<Location|undefined>,
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
            processedMenuData: computed(() => (Array.isArray(props.menuData) ? props.menuData : [props.menuData])),
            isFolded: false,
            isFoldableMenu: computed(() => state.processedMenuData?.some(item => item.foldable)),
            showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
            hoveredItem: '',
        });

        const handleToggle = () => {
            state.isFolded = !state.isFolded;
        };

        const checkSelectedMenu = (selectedMenuRoute: Location) => {
            const currentRoute = props.currentRoute;
            if (currentRoute?.name !== selectedMenuRoute.name) return false;
            if (selectedMenuRoute.params) {
                return isEqual(currentRoute?.params, selectedMenuRoute.params);
            } return true;
        };

        const getIsHovered = (itemId: string) => state.hoveredItem && state.hoveredItem === itemId;

        return {
            ...toRefs(state),
            handleToggle,
            checkSelectedMenu,
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
