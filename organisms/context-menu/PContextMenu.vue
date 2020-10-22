<template>
    <div ref="contextMenu" class="p-context-menu" :class="theme"
         :style="autoHeightStyle"
         @keyup.esc="$emit('keyup:esc',$event)"
    >
        <slot v-if="loading" name="loading" v-bind="{...$props, uuid}">
            <div key="loading" class="context-content context-item no-drag">
                <slot name="loading-format" v-bind="{...$props, uuid}">
                    <p-lottie name="thin-spinner" auto :size="1"
                              class="flex items-center justify-center"
                    />
                </slot>
            </div>
        </slot>
        <slot v-else-if="menu.length === 0" name="no-data" v-bind="{...$props, uuid}">
            <div key="no-data" class="context-content context-item no-drag empty" :class="theme">
                <slot name="no-data-format" v-bind="{...$props, uuid}">
                    {{ $t('COMMON.NO_ITEM') }}
                </slot>
            </div>
        </slot>
        <slot v-else name="menu" v-bind="{...$props, uuid}">
            <template v-for="(item, index) in menu">
                <slot v-if="item.type==='item'" name="item" v-bind="{...$props, uuid, item, index}">
                    <slot :name="`item-${item.name}`" v-bind="{...$props, uuid, item, index}">
                        <a :id="`context-item-${index}-${uuid}`"
                           :key="`${item.name}-${index}`"
                           :tabindex="index"
                           class="context-content context-item no-drag"
                           :class="{ disabled: item.disabled, [theme]: true }"
                           :href="item.link"
                           :target="item.target"
                           @click.stop="menuClick(item.name, index, $event)"
                           @keyup.up="onUpKey(index)"
                           @keyup.down="onDownKey(index)"
                           @keyup.enter="menuClick(item.name, index, $event)"
                        >
                            <slot name="item--format" v-bind="{...$props, uuid, item, index}">
                                <slot :name="`item-${item.name}-format`" v-bind="{...$props, uuid, item, index}">
                                    <span>{{ item.label }}</span>
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
    </div>
</template>

<script lang="ts">
import {
    computed, ref, onMounted, Ref,
} from '@vue/composition-api';

import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { ContextMenuProps, CONTEXT_MENU_THEME } from '@/components/organisms/context-menu/type';

const setAutoHeight = (props) => {
    const contextMenu = ref(null) as Ref<HTMLElement|null>;
    const contextMenuHeight = ref(0);
    const autoHeightStyle = computed(() => {
        if (props.autoHeight && contextMenuHeight.value) {
            return {
                height: `${contextMenuHeight.value}px`,
                overflowY: 'auto',
            };
        } return null;
    });
    onMounted(() => {
        if (!props.autoHeight) return;
        const winHeight = window.innerHeight;
        const rects: any = contextMenu.value?.getBoundingClientRect();
        if (rects.bottom > winHeight) contextMenuHeight.value = winHeight - rects.top;
    });

    return {
        contextMenu, contextMenuHeight, autoHeightStyle,
    };
};

export default {
    name: 'PContextMenu',
    events: ['select', 'keyup:up:end', 'keyup:down:end', 'keyup:esc'],
    components: { PLottie, PI },
    props: {
        menu: {
            type: [Array, Object],
            default: () => [],
        },
        theme: {
            type: String,
            default: 'secondary',
            validator(theme) {
                return Object.keys(CONTEXT_MENU_THEME).includes(theme);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        autoHeight: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ContextMenuProps, { emit }) {
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
                if (props.menu[i].type === 'item' && !props.menu[i].disabled) idxs.push(i);
            }
            return idxs;
        });
        const focus = (position) => {
            const idx = itemsIndex.value[position || 0];
            const el = document.getElementById(`context-item-${idx}-${uuid}`);
            if (el) el.focus();
            emit('focus', idx);
        };
        const onUpKey = (idx: number) => {
            const pos = itemsIndex.value.indexOf(idx);
            if (pos !== 0) {
                focus(pos - 1);
            } else {
                emit('keyup:up:end');
            }
        };
        const onDownKey = (idx) => {
            const pos = itemsIndex.value.indexOf(idx) + 1;
            if (pos !== itemsIndex.value.length) {
                focus(pos);
            } else {
                emit('keyup:down:end');
            }
        };

        return {
            menuClick,
            onDownKey,
            onUpKey,
            focus,
            uuid,
            ...setAutoHeight(props),
        };
    },
};
</script>

<style lang="postcss">
@define-mixin context-menu-theme $bg-color, $border-color {
    background-color: $bg-color;
    border: 1px solid $border-color;
    .context-divider {
        border-top-color: $border-color;
    }
}
@define-mixin context-item-theme $color, $hover-bg-color, $hover-color, $active-bg-color, $active-color, $disabled-color {
    color: $color;
    &:hover {
        background-color: $hover-bg-color;
        color: $hover-color !important;
    }
    &:focus {
        background-color: $hover-bg-color;
        color: $hover-color !important;
    }
    &:active {
        background-color: $active-bg-color;
        color: $active-color !important;
    }
    &.disabled {
        color: $disabled-color !important;
        cursor: not-allowed;
        &:hover, &:focus {
            background-color: transparent;
            color: $disabled-color !important;
        }
    }
    &.empty {
        color: $disabled-color !important;
        cursor: default;
        &:hover {
            background-color: transparent;
            color: $disabled-color !important;
        }
    }
}

.p-context-menu {
    padding: 0;
    border-radius: 2px;
    margin: -1px 0 0 0;
    min-width: 100%;
    cursor: default;
    position: absolute;
    z-index: 1000;
    float: left;
    text-align: left;
    list-style: none;
    background-clip: padding-box;
    display: block;
    max-height: 32rem;
    overflow-y: auto;

    &.secondary {
        @mixin context-menu-theme theme('colors.white'), theme('colors.secondary');
    }
    &.gray900 {
        @mixin context-menu-theme theme('colors.white'), theme('colors.gray.900');
    }
    &.white {
        @mixin context-menu-theme theme('colors.white'), theme('colors.gray.200');
        top: 2.5rem;
        left: -1.125rem;
        min-width: 10rem;
        font-size: 0.875rem;
        white-space: pre;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
    }
    &.right-align {
        right: 0;
        left: auto;
    }

    .context-content {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    .context-header {
        margin-top: 0.875rem;
        margin-bottom: 0.25rem;
        font-weight: bold;
        font-size: 0.75rem;

        &.secondary {
            @apply text-gray-900;
        }
        &.gray900 {
            @apply text-gray-400;
        }
    }
    .context-divider {
        margin: 0;
        border-top-width: 1px;
        border-top-style: solid;
    }
    .context-item {
        position: relative;
        display: block;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
        line-height: 1rem;
        font-size: 0.875rem;
        cursor: pointer;
        white-space: nowrap;

        .external-link-icon {
            position: absolute;
            top: 0.5rem;
            right: 1rem;
        }

        &.secondary {
            @mixin context-item-theme theme('colors.gray.900'), theme('colors.secondary'), theme('colors.white'),
            theme('colors.secondary2'), theme('colors.secondary'), theme('colors.gray.200');
        }
        &.gray900 {
            @mixin context-item-theme theme('colors.gray.900'), theme('colors.gray.100'), theme('colors.gray.900'),
            theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.200');
        }
        &.white {
            @mixin context-item-theme theme('colors.gray.900'), theme('colors.primary4'), theme('colors.primary'),
            theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.200');
            border-radius: 0.25rem;
        }
    }
    .no-drag {
        user-select: none;
    }
}
</style>
