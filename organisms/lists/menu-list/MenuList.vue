<template>
    <div ref="container" class="p-menu-list">
        <p-tooltip-button :tooltip="tooltip"
                          :tooltip-options="tooltipOptions"
                          :active="visible"
                          @click.stop="() => {}"
        >
            <template #button>
                <p-button class="activator" :class="{active: visible}" @click="show">
                    <slot name="contents">
                        {{ contents }}
                    </slot>
                </p-button>
            </template>
        </p-tooltip-button>

        <transition name="fade-in">
            <div v-if="visible"
                 class="menu-container"
                 :style="{left: position}"
            >
                <p-menu-item
                    v-for="(item, idx) in listItems"
                    :key="idx"
                    class="menu"
                    :contents="item.contents"
                    :indent="item.indent"
                    :selected="item.selected"
                    @click.stop="select(item, idx, $event)"
                />
            </div>
        </transition>
    </div>
</template>

<script>
import _ from 'lodash';
import PMenuItem from '@/components/molecules/menu-item/PMenuItem.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

const ACTIVATOR_MENU_SPACE = -8;

export default {
    name: 'PMenuList',
    events: ['change', 'show', 'hide', 'select'],
    components: { PMenuItem, PTooltipButton, PButton },
    props: {
        listItems: {
            type: Array,
            default: () => ([]),
            validator(listItems) {
                return listItems.every((listItem) => {
                    const keys = Object.keys(listItem);
                    return keys.every(key => ['key', 'contents', 'indent', 'selected'].includes(key));
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
            selectedIdx: null,
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
        this.setSelectedIdx();
        document.addEventListener('click', this.hide, true);
        document.addEventListener('click', this.hide, false);
    },
    destroyed() {
        document.removeEventListener('click', this.hide, true);
        document.removeEventListener('click', this.hide, false);
    },
    methods: {
        setSelectedIdx() {
            this.listItems.some((item, idx) => {
                if (item.selected) this.selectedIdx = idx;
                return item.selected;
            });
        },
        show() {
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        toggle() {
            this.visible = !this.visible;
        },
        select(item, idx, e) {
            this.hide();
            if (this.selectedIdx !== null) {
                this.$set(this.listItems[this.selectedIdx], 'selected', false);
                this.$set(this.listItems[idx], 'selected', true);
                this.selectedIdx = idx;
            }
            this.$emit('select', item, idx, e);
        },
    },
};
</script>

<style lang="postcss" scoped>
.p-menu-list {
    position: relative;
    .activator {
        @apply text-primary4;
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        border: 0px;
        min-width: 32px;
        line-height:1;
        &:hover, &.active {
            @apply bg-primary-dark;
        }
    }
    .menu-container {
        @apply bg-white;
        position: absolute;
        bottom: 0;
        box-shadow: 4px 0px 8px rgba(theme('colors.gray.900'), 0.52);
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
