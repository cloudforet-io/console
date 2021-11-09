<template>
    <div v-if="show" class="gnb-menu" :class="{disabled: !hasPermission}">
        <div class="menu-button"
             :class="[{
                 opened: subMenuList.length > 0 && isOpened,
                 selected: isSelected,
             }]"
             @click.stop="emitToggle"
        >
            <span v-if="subMenuList.length > 0">
                <span>{{ label }}</span>
                <p-i class="arrow-button"
                     :name="isOpened ? 'ic_arrow_top_sm' : 'ic_arrow_bottom_sm'"
                     width="0.5rem" height="0.5rem"
                     color="inherit transparent"
                />
            </span>

            <component :is="hasPermission ? 'router-link' : 'span'"
                       v-else
                       :to="to"
                       class="block"
            >
                <span>{{ label }}</span>
            </component>

            <div v-if="isOpened && subMenuList.length > 0"
                 v-click-outside="emitHide"
                 class="sub-menu-wrapper"
            >
                <g-n-b-sub-menu v-for="(subMenu, index) in subMenuList"
                                :key="index"
                                :show="subMenu.show"
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
import vClickOutside from 'v-click-outside';
import { PI } from '@spaceone/design-system';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';

export default {
    name: 'GNBMenu',
    components: {
        PI,
        GNBSubMenu,
    },
    directives: {
        clickOutside: vClickOutside.directive,
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
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const emitToggle = () => {
            emit('toggle', props.name);
        };

        const emitHide = () => {
            emit('hide');
        };

        return {
            emitToggle,
            emitHide,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-menu {
    position: relative;
    display: inline-block;

    @screen tablet {
        display: none;
    }
    .menu-button {
        @apply text-gray-900;
        font-size: 0.875rem;
        cursor: pointer;
        text-decoration: none;
        text-transform: capitalize;
        opacity: 0.5;

        &.opened {
            @apply text-primary;
            opacity: 1;
        }
        &.selected {
            opacity: 1;
        }
        &:hover {
            @apply text-primary;
            opacity: 1;
        }

        .arrow-button {
            margin-left: 0.25rem;
        }
    }
    &.disabled {
        .menu-button {
            @apply text-gray-900;
            cursor: not-allowed;
            opacity: 0.2;

            &.selected {
                opacity: 0.2;
            }
            &:hover {
                @apply text-gray-900;
                opacity: 0.2;
            }
        }
    }
    .sub-menu-wrapper {
        @apply bg-white border border-gray-200 rounded-sm;
        position: absolute;
        top: 2.5rem;
        left: -1.125rem;
        min-width: 10rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        margin: 3px 0;
    }
}
</style>
