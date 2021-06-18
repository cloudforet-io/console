<template>
    <div class="p-context-menu"
         :class="{[theme]: true, invalid}"
         @keyup.esc="onEsc"
    >
        <slot v-if="!alwaysShowMenu && menu.length === 0" name="no-data" v-bind="{...$props, uuid}">
            <div key="no-data" class="context-item no-drag empty" :class="theme">
                <slot name="no-data-format" v-bind="{...$props, uuid}">
                    {{ $t('COMPONENT.CONTEXT_MENU.NO_ITEM') }}
                </slot>
            </div>
        </slot>
        <slot v-else name="menu" v-bind="{...$props, uuid}">
            <template v-for="(item, index) in menu">
                <slot v-if="item.type === undefined || item.type === 'item'" name="item" v-bind="{...$props, uuid, id: `context-item-${index}-${uuid}`, item, index}">
                    <slot :name="`item-${item.name}`" v-bind="{...$props, uuid, id: `context-item-${index}-${uuid}`, item, index}">
                        <a :id="`context-item-${index}-${uuid}`"
                           :key="`${item.name}-${index}`"
                           :tabindex="index"
                           class="context-item no-drag"
                           :class="{ disabled: item.disabled, [theme]: true }"
                           :href="item.disabled ? undefined : item.link"
                           :target="item.target"
                           @click.stop="menuClick(item.name, index, $event)"
                           @keydown.up="onUpKey(index)"
                           @keydown.down="onDownKey(index)"
                           @keyup.enter="menuClick(item.name, index, $event)"
                        >
                            <slot name="item--format" v-bind="{...$props, uuid, item, index}">
                                <slot :name="`item-${item.name}-format`" v-bind="{...$props, uuid, item, index}">
                                    <span class="text" :class="{'with-icon': item.target === '_blank'}">
                                        {{ item.label }}
                                    </span>
                                    <p-i v-if="item.target === '_blank'" class="external-link-icon" name="ic_external-link"
                                         width="0.875rem" height="0.875rem"
                                    />
                                </slot>
                            </slot>
                        </a>
                    </slot>
                </slot>
                <slot v-else-if="item.type==='info'" name="info">
                    <slot name="info--format" />
                </slot>
                <slot v-else-if="item.type==='divider'" name="divider" v-bind="{...$props, uuid, item, index}">
                    <slot :name="`divider-${item.name}`" v-bind="{...$props, uuid, item, index}">
                        <div :key="index" class="context-divider"
                             @click.stop
                        />
                    </slot>
                </slot>
                <slot v-else-if="item.type==='header'" name="header" v-bind="{...$props, uuid, item, index}">
                    <slot :name="`header-${item.name}`" v-bind="{...$props, uuid, item, key: index}">
                        <div :key="index" class="context-content context-header no-drag"
                             :class="theme"
                             @click.stop
                        >
                            <slot name="header--format" v-bind="{...$props, uuid, item, index}">
                                <slot :name="`header-${item.name}-format`" v-bind="{...$props, uuid, item, index}">
                                    {{ item.label }}
                                </slot>
                            </slot>
                        </div>
                    </slot>
                </slot>
            </template>
        </slot>

        <slot v-if="loading" name="loading" v-bind="{...$props, uuid}">
            <div key="loading" class="loader">
                <slot name="loading-format" v-bind="{...$props, uuid}">
                    <p-lottie name="thin-spinner" auto :size="1" />
                </slot>
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import PLottie from '@/foundation/lottie/PLottie.vue';
import PI from '@/foundation/icons/PI.vue';

import { ContextMenuProps, CONTEXT_MENU_THEME } from '@/inputs/context-menu/type';
import { i18n } from '@/translations';

export default defineComponent<ContextMenuProps>({
    name: 'PContextMenu',
    components: { PLottie, PI },
    i18n,
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
        theme: {
            type: String,
            default: 'secondary',
            validator(theme: any) {
                return Object.values(CONTEXT_MENU_THEME).includes(theme);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        alwaysShowMenu: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ContextMenuProps, { emit }) {
        const state = reactive({
        });

        let focusedEl: HTMLElement|null = null;
        const uuid = `${Math.random()}`.slice(2);
        const menuClick = (itemName, index, event) => {
            if (!props.menu[index].disabled) {
                emit(`${itemName}:select`, index, event);
                emit('select', itemName, index);
            }
        };
        const itemsIndex = computed<number[]>(() => {
            const idxs: number[] = [];
            for (let i = 0; i < Object.keys(props.menu).length; i++) {
                if ((props.menu[i].type === undefined || props.menu[i].type === 'item')
                    && !props.menu[i].disabled) idxs.push(i);
            }
            return idxs;
        });
        const focus = (position) => {
            const idx = position === -1 ? itemsIndex.value[itemsIndex.value.length - 1] : itemsIndex.value[position || 0];
            const el = document.getElementById(`context-item-${idx}-${uuid}`);
            if (el) {
                el.focus();
                focusedEl = el;
                emit('focus', idx);
            }
        };
        const blur = () => {
            if (focusedEl) {
                focusedEl.blur();
                focusedEl = null;
            }
            emit('blur');
        };
        const onUpKey = (idx: number) => {
            const pos = itemsIndex.value.indexOf(idx);
            if (pos !== 0) {
                focus(pos - 1);
            } else {
                emit('keyup:up:end');
                blur();
            }
        };
        const onDownKey = (idx) => {
            const pos = itemsIndex.value.indexOf(idx) + 1;
            if (pos !== itemsIndex.value.length) {
                focus(pos);
            } else {
                emit('keyup:down:end');
                blur();
            }
        };
        const onEsc = (e) => {
            emit('keyup:esc', e);
            blur();
        };

        return {
            ...toRefs(state),
            menuClick,
            onDownKey,
            onUpKey,
            focus,
            uuid,
            onEsc,
        };
    },
});
</script>

<style lang="postcss">
.p-context-menu {
    @apply rounded;
    position: relative;
    min-width: 100%;
    text-align: left;
    background-clip: padding-box;
    max-height: 32rem;
    overflow-y: auto;
    border-width: 1px;
    border-style: solid;

    &.invalid {
        @apply border-alert;
    }

    .context-header {
        margin-top: 0.875rem;
        margin-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.5;
    }
    .context-divider {
        border-top-width: 1px;
        border-top-style: solid;
    }
    .context-item {
        display: flex;
        padding: 0.25rem 0.5rem;
        line-height: 1.6;
        font-size: 0.875rem;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;

        .text {
            @apply truncate;
            flex-shrink: 0;
            flex-grow: 1;
            max-width: 100%;
            &.with-icon {
                max-width: calc(100% - 0.25rem - 0.875rem);
            }
        }
        .external-link-icon {
            flex-shrink: 0;
            margin-left: 0.25rem;
        }
    }
    .no-drag {
        user-select: none;
    }

    .loader {
        @apply absolute w-full h-full flex items-center justify-center;
        left: 0;
        top: 0;
        background-color: rgba(theme('colors.white'), 0.5);
    }

    /* themes */
    @define-mixin context-menu-theme $bg-color, $border-color, $header-color,
        $color, $hover-bg-color, $hover-color,
        $active-bg-color, $active-color, $disabled-color {
        background-color: $bg-color;

        &:not(.invalid) {
            border-color: $border-color;
        }

        .context-divider {
            border-top-color: $border-color;
        }

        .context-header {
            color: $header-color;
        }

        .context-item {
            color: $color;
            &:not(.disabled):not(.empty) {
                &:hover, &:focus {
                    background-color: $hover-bg-color;
                    color: $hover-color;
                }
            }
            &:not(.disabled):not(.empty):not(:hover):not(:focus):active {
                background-color: $active-bg-color;
                color: $active-color;
            }
            &.disabled {
                color: $disabled-color;
                cursor: not-allowed;
            }
            &.empty {
                color: $disabled-color;
                cursor: default;
            }
        }
    }

    &.secondary {
        @mixin context-menu-theme theme('colors.white'), theme('colors.secondary'), theme('colors.secondary'),
            theme('colors.gray.900'), theme('colors.blue.200'), theme('colors.gray.900'),
            theme('colors.secondary2'), theme('colors.secondary'), theme('colors.gray.300');
    }
    &.gray900 {
        @mixin context-menu-theme theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.400'),
            theme('colors.gray.900'), theme('colors.gray.100'), theme('colors.gray.900'),
            theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.300');
    }
}
</style>
