<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useFocus, useWindowSize } from '@vueuse/core';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import { PI, screens, PIconButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';

const { width } = useWindowSize();

const inputRef = ref<null|HTMLInputElement>(null);
const { focused } = useFocus(inputRef);

const topBarSearchStore = useTopBarSearchStore();


const state = reactive({
    isMobileSize: computed(() => width.value < screens.mobile.max),
    placeholder: computed(() => {
        if (state.isMobileSize) return i18n.t('COMMON.GNB.SEARCH.SEARCH');
        return i18n.t('COMMON.GNB.SEARCH.SEARCH_PLACEHOLDER');
    }),
    metaName: computed(() => {
        const userAgent = window.navigator.userAgent;
        if (userAgent.indexOf('Mac') !== -1) return 'cmd';
        return 'Ctrl';
    }),
    isFilledAndActivated: computed(() => topBarSearchStore.state.inputText || focused.value),
});

const handleUpdateInput = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    topBarSearchStore.$patch((_state) => {
        _state.state.inputText = target.value;
    });
};

const handleInitInput = () => {
    topBarSearchStore.$patch((_state) => {
        _state.state.inputText = '';
    });
};

const handleClose = () => {
    topBarSearchStore.setIsActivated(false);
};

const handleFocusInput = (focus: boolean) => {
    focused.value = focus;
};

</script>

<template>
    <div class="top-bar-search-mobile-input"
         @click.stop="$emit('click')"
    >
        <div class="input-box">
            <p-icon-button name="ic_arrow-left"
                           height="1.5rem"
                           width="1.5rem"
                           color="inherit"
                           @click="handleClose"
            />
            <div class="mobile-input-wrapper">
                <div class="mobile-input">
                    <p-i name="ic_search"
                         height="1.5rem"
                         width="1.5rem"
                         color="inherit"
                    />
                    <input ref="inputRef"
                           :value="topBarSearchStore.state.inputText"
                           :placeholder="state.placeholder"
                           @input="handleUpdateInput"
                           @focus="$emit('update:isFocused', true)"
                           @blur="$emit('update:isFocused', false)"
                           @keyup.esc="$emit('esc')"
                           @keydown.up="$emit('arrow-up')"
                           @keydown.down="$emit('arrow-down')"
                    >
                    <p-i v-if="topBarSearchStore.state.inputText"
                         name="ic_close"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                         class="delete-button"
                         @click.stop="handleInitInput"
                    />
                </div>
                <div v-if="!state.isFilledAndActivated"
                     v-on-click-outside="handleFocusInput(false)"
                     class="input-cover"
                     @click="handleFocusInput(true)"
                >
                    <p-i name="ic_search"
                         height="1.5rem"
                         width="1.5rem"
                         color="inherit"
                    />
                    <span>{{ state.placeholder }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-search-mobile-input {
    .input-box {
        @apply flex items-center bg-white text-gray-500 fixed;
        top: 0rem;
        left: 0;
        right: 0;
        margin: 0 auto;
        z-index: 1000;
        width: 100%;
        height: 3.125rem;
        padding: 1rem 0.75rem 0.75rem 0.5rem;
        font-size: 0.875rem;

        .mobile-input-wrapper {
            width: 100%;
            position: relative;
            .mobile-input {
                @apply flex items-center bg-white rounded-md text-gray-500 border border-gray-200;
                width: 100%;
                height: 2rem;
                padding: 0 0.75rem;
                box-sizing: border-box;

                input {
                    @apply text-gray-900;
                    background-color: inherit;
                    width: 100%;

                    &::placeholder {
                        @apply text-gray-400;
                    }
                }

                &:focus-within {
                    @apply flex items-center bg-white rounded-md text-gray-500;
                    box-shadow: 0 0 0 2px rgba(73, 167, 247, 0.2);

                    input {
                        width: 100%;
                    }
                }

                .delete-button {
                    @apply text-gray-400;
                    cursor: pointer;
                }
            }
            .input-cover {
                @apply flex items-center justify-center bg-gray-100 rounded-md text-gray-400 absolute;
                left: 0;
                top: 0;
                height: 2rem;
                width: 100%;

                &:hover {
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
