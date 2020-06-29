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
import PMenuItem from '@/components/molecules/menu-item/MenuItem.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import {
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';

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

    setup(props, context) {
        const vm = getCurrentInstance();

        const state = reactive({
            visible: false,
            selectedIdx: null,
            container: null,
        });

        // const activatorElement = ref(null);
        const position = computed(() => `${state.container ? state.container.clientWidth + ACTIVATOR_MENU_SPACE : undefined}px`);

        const setSelectedIdx = () => {
            props.listItems.some((item, idx) => {
                if (item.selected) state.selectedIdx = idx;
                return item.selected;
            });
        };

        const show = () => {
            state.visible = true;
        };

        const hide = () => {
            state.visible = false;
        };

        const toggle = () => {
            state.visible = !state.visible;
        };

        const select = (item, idx, e) => {
            hide();
            if (state.selectedIdx !== null) {
                vm.$set(props.listItems[state.selectedIdx], 'selected', false);
                vm.$set(props.listItems[idx], 'selected', true);
            }
            vm.$emit('select', item, idx, e);
        };

        onMounted(() => {
            setSelectedIdx();
            document.addEventListener('click', hide, true);
            document.addEventListener('click', hide, false);
        });

        onUnmounted(() => {
            document.removeEventListener('click', hide, true);
            document.removeEventListener('click', hide, false);
        });

        return {
            ...toRefs(state),
            setSelectedIdx,
            show,
            hide,
            toggle,
            select,
            position,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-menu-list {
        position: relative;
    .activator {
        @apply text-primary4 bg-primary-dark;
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
