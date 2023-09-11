<script lang="ts" setup>
import { PI } from '@spaceone/design-system';
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref,
} from 'vue';
import type { RouteLocation } from 'vue-router';
import { useRouter, useRoute } from 'vue-router';

import type { DisplayMenu, HighlightTagType } from '@/store/modules/display/type';
import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import { customMenuNameList } from '@/common/modules/navigations/gnb/config';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardMenu
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardMenu.vue';
import IntegrationSubMenu
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/Integration-menu/IntegrationSubMenu.vue';


interface SubMenu extends DisplayMenu {
    href?: string;
}

type RawRouteLocation = RouteLocation | string;

interface Props {
    show: boolean;
    menuId: MenuId;
    label: string;
    to?: RawRouteLocation;
    href?: string;
    hasPermission: boolean;
    isOpened: boolean;
    isSelected: boolean;
    subMenuList: SubMenu[];
    highlightTag?: HighlightTagType;
}

const props = withDefaults(defineProps<Props>(), {
    show: true,
    menuId: '' as MenuId,
    label: '',
    to: undefined,
    href: undefined,
    hasPermission: true,
    isOpened: false,
    isSelected: false,
    subMenuList: () => [],
    highlightTag: undefined,
});
const emit = defineEmits<{(e: 'hide-menu'): void;
    (e: 'open-menu', value: MenuId): void;
}>();
const router = useRouter();
const route = useRoute();
const containerRef = ref<HTMLElement | null>(null);
const state = reactive({
    hasCustomMenu: computed<boolean>(() => customMenuNameList.includes(props.menuId)),
    hasSubMenu: computed<boolean>(() => props.subMenuList?.length > 0),
    isMenuWithAdditionalMenu: computed<boolean>(() => state.hasSubMenu || state.hasCustomMenu),
});
const hideMenu = () => {
    emit('hide-menu');
};

const handleMenu = () => {
    if (state.isMenuWithAdditionalMenu) {
        emit('open-menu', props.menuId);
    } else {
        const isDuplicatePath = route.name === props.menuId;
        if (isDuplicatePath) return;
        hideMenu();
        if (props.to) router.push(props.to);
        else if (props.href) window.open(props.href, '_blank');
    }
};

const handleClickOutside = () => {
    if (props.isOpened) hideMenu();
};
onClickOutside(containerRef, handleClickOutside);

</script>

<template>
    <div v-if="show"
         ref="containerRef"
         class="gnb-menu"
         :class="{disabled: !hasPermission}"
    >
        <div class="menu-button"
             :class="[{
                 opened: state.isMenuWithAdditionalMenu && isOpened,
                 selected: isSelected,
             }]"
        >
            <span class="button-label"
                  tabindex="0"
                  @click="handleMenu"
                  @keydown.enter="handleMenu"
            >
                <span>{{ label }}</span>
                <span v-if="highlightTag"
                      class="mark"
                >
                    <new-mark v-if="highlightTag === 'new'" />
                    <update-mark v-else-if="highlightTag === 'update'" />
                    <beta-mark v-else-if="highlightTag === 'beta'" />
                </span>
                <p-i v-if="state.isMenuWithAdditionalMenu"
                     class="arrow-button"
                     :name="isOpened ? 'ic_chevron-small-up' : 'ic_chevron-small-down'"
                     width="0.5rem"
                     height="0.5rem"
                     color="inherit transparent"
                />
            </span>

            <div v-if="state.hasCustomMenu"
                 v-show="isOpened"
                 class="custom-menu-wrapper"
            >
                <g-n-b-dashboard-menu v-show="menuId === MENU_ID.DASHBOARDS"
                                      @close="hideMenu"
                />
                <integration-sub-menu v-show="menuId === DOMAIN_CONFIG_TYPE.EXTRA_MENU"
                                      @close="hideMenu"
                />
            </div>
            <div v-else-if="state.hasSubMenu"
                 v-show="isOpened"
                 class="sub-menu-wrapper"
            >
                <g-n-b-sub-menu v-for="(subMenu, index) in subMenuList"
                                :key="index"
                                :show="!subMenu.hideOnGNB"
                                :label="subMenu.label"
                                :to="subMenu.to"
                                :href="subMenu.href"
                                :highlight-tag="subMenu.highlightTag"
                                @navigate="hideMenu"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-menu {
    position: relative;
    display: inline-block;
    margin-left: 2rem;

    .menu-button {
        @apply text-gray-900;
        font-size: 0.875rem;
        line-height: $gnb-height;
        cursor: pointer;
        text-decoration: none;
        text-transform: capitalize;

        .button-label {
            @apply inline-block flex items-center;
            height: 100%;

            .mark {
                text-transform: none;
                height: 1.5rem;
                line-height: normal;
            }
        }

        &.opened, &:hover {
            @apply text-violet-600;
        }
        .arrow-button {
            margin-left: 0.25rem;
        }
    }

    &.disabled {
        .menu-button {
            @apply text-gray-300;
            cursor: not-allowed;

            &:hover {
                @apply text-gray-300;
            }
        }
    }

    .sub-menu-wrapper {
        @apply bg-white border border-gray-200 rounded-xs;
        position: absolute;
        top: $gnb-height;
        margin-top: -0.5rem;
        left: -1.125rem;
        min-width: 10rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 10%);
        padding: 0.5rem;
    }
    .custom-menu-wrapper {
        @apply rounded-xs;
        cursor: auto;
        position: absolute;
        top: $gnb-height;
        margin-top: -0.5rem;
        left: -1.125rem;
        min-width: 10rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 10%);
    }
}

@screen laptop {
    .gnb-menu {
        margin-left: 1.5rem;
    }
}

@screen tablet {
    .gnb-menu {
        display: none;
    }
}

</style>
