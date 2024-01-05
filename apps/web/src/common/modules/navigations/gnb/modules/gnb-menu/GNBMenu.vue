<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { RawLocation } from 'vue-router';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import type { DisplayMenu, HighlightTagType } from '@/store/modules/display/type';
import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

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

interface Props {
    menuId: MenuId;
    show?: boolean;
    label?: TranslateResult;
    to?: RawLocation;
    href?: string;
    hasPermission?: boolean;
    isOpened?: boolean;
    isSelected?: boolean;
    subMenuList?: SubMenu[];
    highlightTag?: HighlightTagType;
    isAdminMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    show: true,
    label: '',
    to: undefined,
    href: undefined,
    hasPermission: true,
    isOpened: false,
    isSelected: false,
    subMenuList: () => [],
    highlightTag: undefined,
    isAdminMode: false,
});
const emit = defineEmits<{(e: 'open-menu', menuId: MenuId): void;
    (e: 'hide-menu'): void;
}>();
const state = reactive({
    hasCustomMenu: computed<boolean>(() => customMenuNameList.includes(props.menuId)),
    hasSubMenu: computed<boolean>(() => props.subMenuList?.length > 0),
    isMenuWithAdditionalMenu: computed<boolean>(() => state.hasSubMenu || state.hasCustomMenu),
});
const hideMenu = () => { emit('hide-menu'); };

const handleMenu = () => {
    if (state.isMenuWithAdditionalMenu) {
        emit('open-menu', props.menuId);
    } else {
        const routeName = MENU_INFO_MAP[props.menuId].routeName;
        const isDuplicatePath = SpaceRouter.router.currentRoute.name === routeName;
        if (isDuplicatePath) return;
        hideMenu();
        if (props.to) SpaceRouter.router.push(props.to);
        else if (props.href) window.open(props.href, '_blank');
    }
};
</script>
<template>
    <div v-if="props.show"
         v-on-click-outside="hideMenu"
         class="gnb-menu"
         :class="{disabled: !props.hasPermission}"
    >
        <div class="menu-button"
             :class="[{
                 opened: state.isMenuWithAdditionalMenu && props.isOpened,
                 selected: props.isSelected,
                 'admin-button': props.isAdminMode,
             }]"
        >
            <span class="button-label"
                  tabindex="0"
                  @click="handleMenu"
                  @keydown.enter="handleMenu"
            >
                <span>{{ props.label }}</span>
                <span v-if="props.highlightTag"
                      class="mark"
                >
                    <new-mark v-if="props.highlightTag === 'new'" />
                    <update-mark v-else-if="props.highlightTag === 'update'" />
                    <beta-mark v-else-if="props.highlightTag === 'beta'" />
                </span>
                <p-i v-if="state.isMenuWithAdditionalMenu"
                     class="arrow-button"
                     :name="props.isOpened ? 'ic_chevron-small-up' : 'ic_chevron-small-down'"
                     width="0.5rem"
                     height="0.5rem"
                     color="inherit transparent"
                />
            </span>

            <div v-if="state.hasCustomMenu"
                 v-show="props.isOpened"
                 class="custom-menu-wrapper"
            >
                <g-n-b-dashboard-menu v-show="props.menuId === MENU_ID.DASHBOARDS"
                                      @close="hideMenu"
                />
                <integration-sub-menu v-show="props.menuId === DOMAIN_CONFIG_TYPE.EXTRA_MENU"
                                      @close="hideMenu"
                />
            </div>
            <div v-else-if="state.hasSubMenu"
                 v-show="props.isOpened"
                 class="sub-menu-wrapper"
            >
                <g-n-b-sub-menu v-for="(subMenu, index) in props.subMenuList"
                                :key="index"
                                :show="!subMenu.hideOnGNB"
                                :label="subMenu.label"
                                :to="subMenu.to"
                                :href="subMenu.href"
                                :highlight-tag="subMenu.highlightTag"
                                @navigate="hideMenu"
                />
            </div>
            <div v-if="props.isSelected"
                 :class="{'menu-underline': true, 'is-admin': props.isAdminMode}"
            />
        </div>
    </div>
</template>
<style lang="postcss" scoped>
.gnb-menu {
    @apply inline-flex items-center relative;

    .menu-button {
        @apply text-gray-900 relative;
        height: 2rem;
        font-size: 0.875rem;
        line-height: $gnb-height;
        cursor: pointer;
        text-decoration: none;
        text-transform: capitalize;
        padding: 0.5rem;

        &.opened, &:hover {
            @apply bg-gray-100 rounded;
        }

        &.admin-button {
            @apply text-violet-100;

            &.opened, &:hover {
                @apply bg-violet-900;
            }
        }

        .button-label {
            @apply inline-block flex items-center;
            height: 100%;

            .mark {
                text-transform: none;
                height: 1.5rem;
                line-height: normal;
            }
        }

        .arrow-button {
            margin-left: 0.25rem;
        }

        .menu-underline {
            @apply absolute bg-violet-500 rounded-t-xs;
            right: 0.5rem;
            bottom: -0.625rem;
            z-index: 999;
            width: calc(100% - 1rem);
            height: 0.1875rem;
            &.is-admin {
                @apply bg-white;
            }
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
        margin-top: -1.125rem;
        left: 0;
        min-width: 10rem;
        z-index: 1000;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
    }
    .custom-menu-wrapper {
        @apply rounded-xs;
        cursor: auto;
        position: absolute;
        z-index: 1000;
        top: $gnb-height;
        margin-top: -1.125rem;
        left: 0;
        min-width: 10rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
    }
}

</style>
