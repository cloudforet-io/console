<template>
    <div v-if="show" v-click-outside="hideMenu" class="gnb-menu"
         :class="{disabled: !hasPermission}"
         @click.stop="handleMenu"
         @keydown.enter="handleMenu"
    >
        <div class="menu-button"
             :class="[{
                 opened: subMenuList.length > 0 && isOpened,
                 selected: isSelected,
             }]"
        >
            <span tabindex="0">
                <span>{{ label }}</span>
                <p-i v-if="subMenuList.length > 0"
                     class="arrow-button"
                     :name="isOpened ? 'ic_arrow_top_sm' : 'ic_arrow_bottom_sm'"
                     width="0.5rem" height="0.5rem"
                     color="inherit transparent"
                />
            </span>

            <div v-if="isOpened && subMenuList.length > 0"
                 class="sub-menu-wrapper"
                 @click.stop="hideMenu"
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

import { PI } from '@spaceone/design-system';
import { vOnClickOutside } from '@vueuse/components';
import { defineComponent } from 'vue';
import type { PropType, DirectiveFunction, SetupContext } from 'vue';

import { SpaceRouter } from '@/router';

import type { DisplayMenu } from '@/store/modules/display/type';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';


export default defineComponent({
    name: 'GNBMenu',
    components: {
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
        name: {
            type: String,
            default: '',
        },
        label: {
            type: String,
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
        const handleMenu = () => {
            if (props.subMenuList?.length > 0) {
                emit('open-menu', props.name);
            } else {
                const isDuplicatePath = SpaceRouter.router.currentRoute.name === props.name;
                if (isDuplicatePath) return;
                SpaceRouter.router.push(props.to);
            }
        };

        const hideMenu = () => {
            emit('hide-menu');
        };

        return {
            handleMenu,
            hideMenu,
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
