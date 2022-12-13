<template>
    <div v-click-outside="hideMenu"
         class="p-search"
         :class="{ focused: proxyIsFocused }"
    >
        <div ref="targetRef"
             class="input-container"
             :class="{ focused: proxyIsFocused, invalid, disabled }"
        >
            <p-i v-if="!disableIcon && !proxyIsFocused && !value && !readonly"
                 class="left-icon"
                 name="ic_search"
                 color="inherit"
            />
            <slot name="left"
                  v-bind="{ value, placeholder: placeholderText }"
            />
            <span class="input-wrapper">
                <slot name="default"
                      v-bind="{ value, placeholder: placeholderText }"
                >
                    <input v-focus.lazy="proxyIsFocused"
                           v-bind="$attrs"
                           :value="value"
                           :placeholder="placeholderText"
                           :disabled="disabled"
                           :readonly="readonly"
                           v-on="inputListeners"
                    >
                </slot>
            </span>
            <slot name="right"
                  v-bind="{ value, placeholder: placeholderText }"
            >
                <div class="right">
                    <span v-if="value"
                          class="delete-btn"
                          @click="handleDelete"
                    >
                        <p-i class="icon"
                             name="ic_delete"
                             height="1rem"
                             width="1rem"
                        />
                    </span>
                </div>
            </slot>
        </div>
        <p-context-menu v-show="proxyVisibleMenu && useAutoComplete"
                        ref="menuRef"
                        :menu="bindingMenu"
                        :highlight-term="proxyValue"
                        :loading="disableHandler ? loading : handlerLoading"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        @select="handleClickMenuItem"
                        @focus="handleFocusMenuItem"
        />
    </div>
</template>

<script lang="ts">
import type { PropType, DirectiveFunction } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { vOnClickOutside } from '@vueuse/components';
import { debounce } from 'lodash';
import { focus } from 'vue-focus';
import type { TranslateResult } from 'vue-i18n';

import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle, useProxyValue } from '@/hooks';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { SearchDropdownMenuItem } from '@/inputs/dropdown/search-dropdown/type';
import type { SearchProps } from '@/inputs/search/search/type';
import { i18n } from '@/translations';
import { makeByPassListeners } from '@/util/composition-helpers';


export default defineComponent<SearchProps>({
    name: 'PSearch',
    components: { PI, PContextMenu },
    i18n,
    directives: { focus, clickOutside: vOnClickOutside as DirectiveFunction },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: String,
            default: '',
            required: true,
        },
        placeholder: {
            type: String,
            default: undefined,
        },
        disableIcon: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        /** sync */
        isFocused: {
            type: Boolean,
            default: undefined,
        },
        /* context menu fixed style props */
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        /* context menu props */
        menu: {
            type: Array as PropType<MenuItem[]>,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        /* extra props */
        handler: {
            type: Function,
            default: undefined,
        },
        disableHandler: {
            type: Boolean,
            default: false,
        },
        useAutoComplete: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit, listeners }) {
        const {
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: computed(() => props.visibleMenu),
        });
        const contextMenuFixedStyleState = reactive({
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        });
        const state = reactive({
            proxyIsFocused: useProxyValue('isFocused', props, emit),
            handlerLoading: false,
            placeholderText: computed<TranslateResult>(() => {
                if (props.placeholder === undefined) return i18n.t('COMPONENT.SEARCH.PLACEHOLDER');
                return props.placeholder;
            }),
            isAutoMode: computed(() => props.visibleMenu === undefined),
            filteredMenu: [] as MenuItem[],
            searchableItems: computed<MenuItem[]>(() => props.menu.filter((d) => d.type === undefined || d.type === 'item')),
            bindingMenu: computed<SearchDropdownMenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
            proxyValue: useProxyValue('value', props, emit),
            menuRef: null,
        });
        const defaultHandler = (inputText: string, list: MenuItem[]) => {
            let results: MenuItem[] = [...list];
            const trimmed = inputText.trim();
            if (trimmed) {
                const regex = new RegExp(inputText, 'i');
                results = results.filter((d) => regex.test(d.label as string));
            }
            return results;
        };
        const filterMenu = debounce(async (val: string) => {
            if (props.disableHandler) return;
            if (props.handler) {
                try {
                    state.handlerLoading = true;
                    let res = props.handler(val, state.searchableItems);
                    if (res instanceof Promise) res = await res;
                    state.filteredMenu = Array.isArray(res) ? res : (res.results ?? []);
                } catch (e) {
                    console.error(e);
                    throw e;
                } finally {
                    state.handlerLoading = false;
                }
            } else {
                const results = defaultHandler(val, state.searchableItems);

                const filtered = props.menu.filter((item) => {
                    if (item.type && item.type !== 'item') return true;
                    return !!results.find((d) => d.label === item.label);
                });
                if (filtered[filtered.length - 1]?.type === 'divider') filtered.pop();
                state.filteredMenu = filtered;
            }
        }, 300);

        const showMenu = () => {
            if (state.isAutoMode) contextMenuFixedStyleState.proxyVisibleMenu = true;
            emit('show-menu');
        };
        const hideMenu = () => {
            if (state.isAutoMode) contextMenuFixedStyleState.proxyVisibleMenu = false;
            emit('hide-menu');
        };
        const focusMenu = () => {
            if (state.bindingMenu.length === 0) return;
            showMenu();

            if (state.menuRef) state.menuRef.focus();
        };
        const blurSearch = () => {
            state.proxyIsFocused = false;
        };
        const allFocusOut = () => {
            blurSearch();
            hideMenu();
        };
        /* event */
        const inputListeners = {
            ...listeners,
            input(e) {
                emit('update:value', e.target.value);
                showMenu();
                filterMenu(e.target.value);
                makeByPassListeners(listeners, 'input', e.target.value, e);
            },
            blur(e) {
                state.proxyIsFocused = false;
                makeByPassListeners(listeners, 'blur', e);
            },
            focus(e) {
                state.proxyIsFocused = true;
                makeByPassListeners(listeners, 'focus', e);
            },
            keyup(e) {
                if (e.code === 'Enter') {
                    emit('search', e.target.value);
                    hideMenu();
                } else if (e.key === 'ArrowDown' || e.key === 'Down') focusMenu();
                else if (e.key === 'Escape' || e.key === 'Esc') allFocusOut();
                makeByPassListeners(listeners, 'keyup', e);
            },
            click(e: MouseEvent) {
                filterMenu(state.proxyValue);
                showMenu();
                makeByPassListeners(listeners, 'click', e);
            },
        };

        const handleFocusMenuItem = (idx: string) => {
            emit('focus-menu', idx);
        };
        const handleClickMenuItem = (item: MenuItem) => {
            const name = item.name;
            state.proxyValue = item.label ?? name;
            emit('search', item.label ?? name);
            hideMenu();
        };
        const handleDelete = () => {
            if (props.disabled) return;
            emit('delete', props.value);
            emit('update:value', '');
        };

        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            inputListeners,
            hideMenu,
            handleDelete,
            handleFocusMenuItem,
            handleClickMenuItem,
        };
    },
});
</script>

<style lang="postcss">
.p-search {
    .input-container {
        @apply flex items-center border border-gray-300 bg-white text-gray-900 px-2 w-full rounded;
        height: auto;
        min-height: 2rem;
        min-width: 0;
        line-height: 2rem;
        box-sizing: border-box;
        &.invalid {
            @apply border-alert;
        }
        &.disabled {
            @apply bg-gray-100;
        }
        &.focused, &:focus-within {
            @apply border-secondary bg-blue-100;
        }
        &:hover:not(.invalid, .disabled) {
            @apply border-secondary;
        }
        .input-wrapper {
            @apply flex flex-wrap flex-grow row-gap-2;
        }
        input {
            @apply border-0 bg-transparent w-full;
            color: inherit;
            font-size: 0.875rem;
            appearance: none;
            min-height: 1.125rem;
            line-height: 1.125rem;
            &::placeholder {
                @apply text-gray-300;
            }
            &:placeholder-shown {
                text-overflow: ellipsis;
            }
            &:focus {
                outline: none;
            }
            &:read-only {
                pointer-events: none;
            }
        }
        .right {
            @apply inline-flex items-center;
        }
        .delete-btn {
            @apply cursor-pointer inline-block flex-shrink-0 rounded-full;
            position: relative;
            height: 1rem;
            width: 1rem;
            &:hover {
                @apply bg-gray-200;
            }
            .icon {
                position: absolute;
            }
        }
        .left-icon {
            @apply text-gray-300 mr-1;
        }
    }
}
</style>
