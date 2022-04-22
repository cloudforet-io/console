<template>
    <div class="lnb-menu-list">
        <div v-for="(item, idx) in menuData" :key="item.id" class="lnb-menu-item">
            <div v-if="item.type === 'title'">
                <p class="title-wrapper">
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
            </div>
            <div v-if="item.type === 'divider' && showMenu" class="divider">
                <p-divider />
            </div>
            <router-link
                v-if="item.type === 'item' && showMenu" class="menu-item"
                :class="[{'second-depth': hasTopTitle}, {'selected': checkSelectedMenu(item.to)}]"
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
                    v-if="showFavorite(item.id)
                        && !item.hideFavorite && !isDomainOwner"
                    :item-id="item.id"
                    :favorite-type="FAVORITE_TYPE.MENU"
                    :favorite-items="favoriteItems"
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
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { LNBItemList } from '@/common/modules/navigations/lnb/type';
import { RawLocation } from 'vue-router';
import { FAVORITE_TYPE, FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { store } from '@/store';

export default {
    name: 'LNBMenuItem',
    components: {
        FavoriteButton,
        PI,
        BetaMark,
        NewMark,
        PDivider,
    },
    props: {
        hasTopTitle: {
            type: Boolean,
            default: false,
        },
        menuData: {
            type: Array as () => LNBItemList,
            default: () => [],
        },
        currentRoute: {
            type: String,
            default: '',
        },
    },

    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            isFolded: false,
            isFoldableMenu: computed(() => props.menuData?.some(item => item.foldable)),
            showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
            favoriteItems: computed<FavoriteItem[]>(() => store.state.favorite.menuItems),
            hoveredItem: '',

        });

        const handleToggle = () => {
            state.isFolded = !state.isFolded;
        };

        const checkSelectedMenu = (selectedMenuRoute: RawLocation) => props.currentRoute.startsWith(vm.$router.resolve(selectedMenuRoute).route.fullPath);

        const showFavorite = (itemId: string) => {
            const isExistedFavorite = state.favoriteItems?.some((i: FavoriteItem) => i.itemId === itemId);
            const isHovered = state.hoveredItem && state.hoveredItem === itemId;
            return isExistedFavorite || isHovered;
        };

        (async () => {
            await store.dispatch('favorite/load', FAVORITE_TYPE.MENU);
        })();

        return {
            ...toRefs(state),
            handleToggle,
            checkSelectedMenu,
            FAVORITE_TYPE,
            showFavorite,
        };
    },
};
</script>

<style lang="postcss" scoped>
.lnb-menu-list {
    margin-bottom: 1.25rem;
}
.lnb-menu-item {
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
        @apply border border-transparent inline-flex items-center w-full h-full justify-between;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 125%;
        border-radius: 4px;
        box-sizing: border-box;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        outline: 0;

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
    }
}
</style>
