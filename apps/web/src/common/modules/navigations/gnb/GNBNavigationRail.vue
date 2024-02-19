<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI } from '@spaceone/design-system';
import type { ContextMenuType } from '@spaceone/design-system/src/inputs/context-menu/type';

import { store } from '@/store';

import type { DisplayMenu } from '@/store/modules/display/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

interface GNBMenuType extends DisplayMenu {
    type: string;
}
interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});

const route = useRoute();

const state = reactive({
    isHovered: false,
    gnbMenuList: computed<GNBMenuType[]>(() => [...store.getters['display/GNBMenuList']]),
    visibleGnbMenuList: computed<GNBMenuType[]>(() => {
        let result = [] as GNBMenuType[];
        state.gnbMenuList.forEach((menu) => {
            result = [
                ...result,
                {
                    ...menu,
                    name: menu.id,
                    type: 'header',
                },
            ];
            if (menu.subMenuList) {
                result = [...result, ...convertGNBMenuToMenuItem(menu.subMenuList)];
            }
        });
        return result;
    }),
    selectedMenuId: computed(() => {
        const selectedMenu = state.visibleGnbMenuList.find((menu) => route.matched[route.matched.length - 1].meta.menuId === menu.id);
        return selectedMenu.id;
    }),
});

const handleMouseEvent = (value: boolean) => {
    state.isHovered = value;
};
const convertGNBMenuToMenuItem = (menuList: GNBMenuType[], menuType: ContextMenuType = 'item'): GNBMenuType[] => menuList.map((menu) => ({
    ...menu,
    name: menu.id,
    type: menuType,
}));
</script>

<template>
    <div class="g-n-b-navigation-rail"
         :class="{'is-minimize': props.isMinimizeGnb}"
         @mouseover="handleMouseEvent(true)"
         @mouseleave="handleMouseEvent(false)"
    >
        <router-link v-for="(item, idx) in state.visibleGnbMenuList"
                     :key="`navigation-rail-item-${idx}`"
                     :to="item.to"
                     class="service-menu"
                     :class="{
                         'is-selected': state.selectedMenuId === item.id,
                         'is-only-label': item.type === 'header' && item.subMenuList?.length > 0
                     }"
        >
            <div class="menu-wrapper">
                <p-i v-if="item.subMenuList?.length === 0"
                     :name="item.icon"
                     class="menu-button"
                     height="1.25rem"
                     width="1.25rem"
                     color="inherit"
                />
                <span v-if="!props.isMinimizeGnb || state.isHovered"
                      class="menu-title"
                >
                    {{ item.label }}
                </span>
            </div>
            <favorite-button v-if="item.subMenuList?.length === 0"
                             class="favorite-button"
                             :item-id="item.id"
                             :favorite-type="FAVORITE_TYPE.MENU"
                             scale="0.65"
            />
        </router-link>
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-navigation-rail {
    @apply flex-col items-start bg-white border-r;
    top: $gnb-toolbox-height;
    width: $gnb-navigation-rail-max-width;
    height: 100%;
    padding: 1rem 0.75rem;
    transition: width 0.3s ease;
    .service-menu {
        @apply flex items-center justify-between text-label-md;
        width: 100%;
        height: 2.125rem;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        gap: 0.75rem;
        border-radius: 0.25rem;
        .menu-wrapper {
            @apply flex items-center;
            gap: 0.625rem;
        }
        .favorite-button {
            @apply hidden;
        }
        &:hover:not(.is-only-label) {
            @apply bg-violet-100 cursor-pointer;
            .favorite-button {
                @apply block;
            }
        }
        &.is-only-label {
            @apply items-end text-gray-500;
            height: 2.875rem;
            padding-bottom: 0.5rem;
        }
        &.is-selected {
            @apply relative bg-violet-100 text-violet-600;
            &::before {
                @apply absolute bg-violet;
                content: '';
                top: 0;
                left: -0.75rem;
                width: 0.25rem;
                height: 100%;
                border-top-right-radius: 0.125rem;
                border-bottom-right-radius: 0.125rem;
            }
        }
    }
    &.is-minimize {
        @apply bg-gray-100 cursor-pointer;
        width: $gnb-navigation-rail-min-width;
        .service-menu {
            width: 2.25rem;
            &:hover:not(.is-only-label) {
                @apply bg-violet-200;
            }
            &.is-selected {
                @apply bg-violet-200;
            }
        }
        &:hover {
            @apply bg-white;
            width: $gnb-navigation-rail-max-width;
            .service-menu {
                width: 100%;
                &:hover:not(.is-only-label) {
                    @apply bg-violet-100;
                }
                &.is-selected {
                    @apply bg-violet-100;
                }
            }
        }
    }
}
</style>
