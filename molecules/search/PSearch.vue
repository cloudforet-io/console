<template>
    <div class="p-search" :class="{
        disabled, focused: proxyIsFocused
    }"
    >
        <slot name="icon" v-bind="slotBind">
            <p-i v-if="!disableIcon && !proxyIsFocused && !value" class="left-icon" name="ic_search"
                 color="inherit"
            />
        </slot>
        <slot name="left" v-bind="slotBind" />
        <slot name="default" v-bind="slotBind">
            <input v-focus.lazy="proxyIsFocused"
                   :value="value"
                   :placeholder="placeholder"
                   :disabled="disabled"
                   v-on="inputListeners"
            >
        </slot>
        <slot name="right" v-bind="slotBind">
            <div class="right">
                <slot name="right-delete" v-bind="slotBind">
                    <span v-if="value" class="delete-btn" @click="onDelete">
                        <p-i class="icon" name="ic_delete" height="1rem"
                             width="1rem"
                        />
                    </span>
                </slot>
                <slot name="right-extra" v-bind="slotBind" />
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import { focus } from 'vue-focus';
import { searchProps } from '@/components/molecules/search/PSearch.toolset';
import {
    computed,
    getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import PI from '@/components/atoms/icons/PI.vue';
import { makeByPassListeners, makeProxy } from '@/components/utils/composition';

export default {
    name: 'PSearch',
    components: { PI },
    directives: { focus },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: searchProps,
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentInstance;
        const state: any = reactive({
            proxyIsFocused: props.isFocused === undefined
                ? props.focused
                : makeProxy('isFocused', props, emit),
        });
        return {
            ...toRefs(state),
            slotBind: computed(() => ({ ...props, isFocused: state.proxyIsFocused })),
            inputListeners: {
                ...vm.$listeners,
                input(e) {
                    emit('update:value', e.target.value);
                    makeByPassListeners(vm.$listeners, 'input', e.target.value, e);
                },
                blur(e) {
                    state.proxyIsFocused = false;
                    makeByPassListeners(vm.$listeners, 'blur', e);
                },
                focus(e) {
                    state.proxyIsFocused = true;
                    makeByPassListeners(vm.$listeners, 'focus', e);
                },
                keyup: (e) => {
                    if (e.code === 'Enter') emit('search', props.value, e);
                    makeByPassListeners(vm.$listeners, 'keyup', e);
                },
            },
            onDelete() {
                emit('delete', props.value);
                emit('update:value', '');
            },
            focus() {
                state.proxyIsFocused = true;
            },
            blur() {
                state.proxyIsFocused = false;
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-search {
        @apply flex items-center border border-gray-300 bg-white text-gray-900 px-3 w-full;
        border-radius: 2px;
        height: 2rem;
        line-height: 2rem;
        min-width: 0;
        &.disabled {
            @apply border-gray-200 bg-gray-100;
        }
        &.focused {
            @apply border-secondary bg-blue-100;
        }
        &:hover {
            @apply border-secondary;
        }
        input {
            @apply border-0 bg-transparent flex-grow;
            color: inherit;
            font-size: 0.875rem;
            appearance: none;
            &::placeholder {
                @apply text-gray-300;
            }
        }
    }
    .right {
        @apply inline-flex;
    }
    .delete-btn {
        @apply cursor-pointer inline-block flex-shrink-0;
        position: relative;
        border-radius: 100px;
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

</style>
