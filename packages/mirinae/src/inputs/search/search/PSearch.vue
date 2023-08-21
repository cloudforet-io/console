<template>
    <div ref="containerRef"
         class="p-search"
         :class="{ focused }"
    >
        <div ref="targetRef"
             class="input-container"
             :class="{ focused, invalid, disabled }"
        >
            <p-i v-if="!disableIcon && !focused && !value && !readonly"
                 class="left-icon"
                 name="ic_search"
                 color="inherit"
            />
            <slot name="left"
                  v-bind="{ value, placeholder: state.placeholderText }"
            />
            <span class="input-wrapper">
                <slot name="default"
                      v-bind="{ value, placeholder: state.placeholderText }"
                >
                    <input ref="inputRef"
                           v-bind="attrs"
                           :value="value"
                           :placeholder="state.placeholderText"
                           :disabled="disabled"
                           :readonly="readonly"
                           v-on="inputListeners"
                    >
                </slot>
            </span>
            <slot name="right"
                  v-bind="{ value, placeholder: state.placeholderText }"
            >
                <div class="right">
                    <span v-if="value"
                          class="delete-btn"
                          @click="handleDelete"
                    >
                        <p-i class="icon"
                             name="ic_close"
                             height="1rem"
                             width="1rem"
                        />
                    </span>
                </div>
            </slot>
        </div>
        <p-context-menu v-if="useAutoComplete"
                        v-show="state.proxyVisibleMenu"
                        ref="menuRef"
                        :menu="state.bindingMenu"
                        :highlight-term="state.proxyValue"
                        :loading="disableHandler ? loading : state.handlerLoading"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        @select="handleClickMenuItem"
                        @focus="handleFocusMenuItem"
        />
    </div>
</template>

<script setup lang="ts">

import { useFocus, onClickOutside } from '@vueuse/core';
import { debounce } from 'lodash';
import {
    computed, reactive, toRef, watch, useAttrs, ref, toRefs,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type { TranslateResult } from 'vue-i18n';

import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle, useProxyValue } from '@/hooks';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { FilterableDropdownMenuItem } from '@/inputs/dropdown/filterable-dropdown/type';
import type { SearchProps } from '@/inputs/search/search/type';
import { makeByPassListeners } from '@/utils/composition-helpers';
import { getTextHighlightRegex } from '@/utils/helpers';

const PContextMenu = () => ({
    component: import('@/inputs/context-menu/PContextMenu.vue'),
});

const props = withDefaults(defineProps<SearchProps>(), {
    value: '',
    disableIcon: false,
    invalid: false,
    disabled: false,
    readonly: false,
    useFixedMenuStyle: false,
    menu: () => [],
    loading: false,
    disableHandler: false,
    useAutoComplete: false,
});
const emit = defineEmits([
    'update:value',
    'update:visibleMenu',
    'show-menu',
    'hide-menu',
    'search',
    'focus-menu',
    'delete',
    'update:is-focused',
]);
const attrs = useAttrs();
const { t } = useI18n();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean | undefined>('visibleMenu', props, emit),
    inputRef: null as null|HTMLElement,
    handlerLoading: true,
    placeholderText: computed<TranslateResult>(() => {
        if (props.placeholder === undefined) return t('COMPONENT.SEARCH.PLACEHOLDER');
        return props.placeholder;
    }),
    filteredMenu: [] as MenuItem[],
    searchableItems: computed<MenuItem[]>(() => props.menu.filter((d) => d.type === undefined || d.type === 'item')),
    bindingMenu: computed<FilterableDropdownMenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
    proxyValue: useProxyValue('value', props, emit),
    menuRef: null,
});

const { inputRef, menuRef } = toRefs(state);
const { focused } = useFocus(toRef(state, 'inputRef'));
const containerRef = ref<HTMLElement|null>(null);

const {
    targetRef, contextMenuStyle,
} = useContextMenuFixedStyle({
    useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
    visibleMenu: toRef(state, 'proxyVisibleMenu'),
});

const defaultHandler = (inputText: string, list: MenuItem[]) => {
    let results: MenuItem[] = [...list];
    const trimmed = inputText.trim();
    if (trimmed) {
        const regex = getTextHighlightRegex(inputText);
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
        state.handlerLoading = false;
    }
}, 300);

const showMenu = () => {
    state.proxyVisibleMenu = true;
    emit('show-menu');
};
const hideMenu = () => {
    state.proxyVisibleMenu = false;
    emit('hide-menu');
};
const focusMenu = () => {
    if (state.bindingMenu.length === 0) return;
    showMenu();

    if (state.menuRef) state.menuRef.focus();
};
const allFocusOut = () => {
    focused.value = false;
    hideMenu();
};


/* event */
const listeners = {
    ...attrs,
};
const inputListeners = {
    ...listeners,
    input(e) {
        emit('update:value', e.target.value);
        showMenu();
        filterMenu(e.target.value);
        makeByPassListeners(listeners, 'input', e.target.value, e);
    },
    blur(e) {
        focused.value = false;
        makeByPassListeners(listeners, 'blur', e);
    },
    focus(e) {
        focused.value = true;
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

watch(() => props.isFocused, (isFocused) => {
    if (typeof isFocused === 'boolean') focused.value = isFocused;
}, { immediate: true });
watch(focused, (_focused) => {
    emit('update:is-focused', _focused);
});

onClickOutside(containerRef, hideMenu);

</script>

<style lang="postcss">
.p-search {
    position: relative;
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
        &:hover:not(.invalid):not(.disabled) {
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
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;
    }
}
</style>
