<template>
    <div v-if="show"
         v-click-outside="hideMenu"
         class="gnb-menu"
         :class="{disabled: !hasPermission}"
    >
        <div class="menu-button"
             :class="[{
                 opened: isMenuWithAdditionalMenu && isOpened,
                 selected: isSelected,
             }]"
        >
            <span class="button-label"
                  tabindex="0"
                  @click="handleMenu"
                  @keydown.enter="handleMenu"
            >
                <span>{{ label }}</span>
                <p-i v-if="isMenuWithAdditionalMenu"
                     class="arrow-button"
                     :name="isOpened ? 'ic_arrow_top_sm' : 'ic_arrow_bottom_sm'"
                     width="0.5rem"
                     height="0.5rem"
                     color="inherit transparent"
                />
            </span>

            <div v-if="hasCustomMenu"
                 v-show="isOpened"
                 class="custom-menu-wrapper"
            >
                <g-n-b-dashboard-menu v-show="menuId === MENU_ID.DASHBOARDS"
                                      @close="hideMenu"
                />
            </div>
            <div v-if="hasSubMenu"
                 v-show="isOpened"
                 class="sub-menu-wrapper"
                 @click="hideMenu"
            >
                <g-n-b-sub-menu v-for="(subMenu, index) in subMenuList"
                                :key="index"
                                :show="!subMenu.hideOnGNB"
                                :label="subMenu.label"
                                :to="subMenu.to"
                                :is-beta="subMenu.isBeta"
                                :is-new="subMenu.isNew"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType, DirectiveFunction, SetupContext } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { RawLocation } from 'vue-router';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import type { DisplayMenu } from '@/store/modules/display/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { customMenuNameList } from '@/common/modules/navigations/gnb/config';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardMenu
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardMenu.vue';

interface Props {
    show: boolean;
    menuId: MenuId;
    label: TranslateResult;
    to?: RawLocation;
    hasPermission: boolean;
    isOpened: boolean;
    isSelected: boolean;
    subMenuList: DisplayMenu[];
}
export default defineComponent<Props>({
    name: 'GNBMenu',
    components: {
        GNBDashboardMenu,
        PI,
        GNBSubMenu,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        show: {
            type: Boolean,
            default: true,
        },
        menuId: {
            type: String as PropType<MenuId>,
            default: '',
        },
        label: {
            type: String as PropType<string | TranslateResult>,
            default: '',
        },
        to: {
            type: Object,
            default: () => ({}),
        },
        hasPermission: {
            type: Boolean,
            default: true,
        },
        isOpened: {
            type: Boolean,
            default: false,
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
        subMenuList: {
            type: Array as PropType<DisplayMenu[]>,
            default: () => [],
        },
    },
    setup(props, { emit }: SetupContext) {
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
                const isDuplicatePath = SpaceRouter.router.currentRoute.name === props.menuId;
                if (isDuplicatePath) return;
                hideMenu();
                if (props.to) SpaceRouter.router.push(props.to);
            }
        };

        return {
            ...toRefs(state),
            handleMenu,
            hideMenu,
            MENU_ID,
        };
    },
});
</script>

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
            display: inline-block;
            height: 100%;
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
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
    }
    .custom-menu-wrapper {
        @apply rounded-xs;
        cursor: auto;
        width: 22.5rem;
        position: absolute;
        top: $gnb-height;
        margin-top: -0.5rem;
        left: -1.125rem;
        min-width: 10rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
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
