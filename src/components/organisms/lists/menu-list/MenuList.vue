<template>
    <div ref="container" class="p-menu-list">
        <p-tooltip-button :tooltip="tooltip"
                          :tooltip-options="tooltipOptions"
                          :active="visible"
                          @click.stop="show"
        >
            <template #button>
                <span class="activator" @click="show">
                    <slot name="activator" :active="visible">
                        <p-button class="activator-btn" :class="{active: visible}">
                            <slot name="contents">
                                {{contents}}
                            </slot>
                        </p-button>
                    </slot>
                </span>
            </template>
        </p-tooltip-button>

        <transition name="fade-in">
            <div v-if="visible"
                 class="menu-container"
                 :style="{left: position}"
            >
                <p-list-item
                    v-for="(item, idx) in listItems"
                    :key="idx"
                    class="menu"
                    :contents="item.contents"
                    :indent="item.indent"
                    @click.stop="select(item, $event)"
                />
            </div>
        </transition>
    </div>
</template>

<script>
import PListItem from '@/components/molecules/list-items/ListItem';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton';
import { LIST_ITEM_PROPERTIES } from './MenuList.map';
import PButton from '@/components/atoms/buttons/Button';

const ACTIVATOR_MENU_SPACE = -8;

export default {
    name: 'PMenuList',
    events: ['change', 'show', 'hide', 'select'],
    components: { PListItem, PTooltipButton, PButton },
    props: {
        listItems: {
            type: Array,
            default: () => ([]),
            validator(listItems) {
                return listItems.every((listItem) => {
                    const keys = Object.keys(listItem);
                    return keys.every(key => LIST_ITEM_PROPERTIES.includes(key));
                });
            },
        },
        contents: {
            type: String,
            default: '',
        },
        tooltip: {
            type: String,
            default: '',
        },
        tooltipOptions: {
            type: Object,
            default: () => ({ offset: '12px' }),
        },
    },
    data() {
        return {
            visible: false,
        };
    },
    computed: {
        activatorElement() {
            return this.$refs.container;
        },
        position() {
            return `${this.activatorElement.clientWidth + ACTIVATOR_MENU_SPACE}px`;
        },
    },
    created() {
        document.addEventListener('click', this.hide, true);
        document.addEventListener('click', this.hide, false);
    },
    destroyed() {
        document.removeEventListener('click', this.hide, true);
        document.removeEventListener('click', this.hide, false);
    },
    methods: {
        show() {
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        select(item, e) {
            this.hide();
            this.$emit('select', item, e);
        },
    },
};
</script>

<style lang="scss" scoped>
.p-menu-list {
    position: relative;
    .activator {
        display: inline-block;
        .activator-btn {
            display: inline-block;
            padding: 0;
            border-radius: 2px;
            min-width: 32px;
            height: 32px;
            color: $primary4;
            &:hover, &.active {
                background-color: $primary-dark;
            }
        }
    }
    .menu-container {
        position: absolute;
        bottom: 0;
        background-color: $white;
        box-shadow: 4px 0px 8px rgba($dark, 0.52);
        &.fade-in-enter-active {
            transition: opacity .15s, visibility .15s;
        }
        &.fade-in-leave-active {
            transition: opacity .15s, visibility .15s;
        }
        &.fade-in-enter, &.fade-in-leave-to {
            visibility: hidden;
            opacity: 0;
        }
        &.fade-in-leave, &.fade-in-enter-to {
            visibility: visible;
            opacity: 1;
        }
    }

}
</style>
