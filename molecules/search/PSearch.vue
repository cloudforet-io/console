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
                   :placeholder="placeholder || $t('COMPONENT.SEARCH.PLACEHOLDER')"
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
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { makeByPassListeners, makeOptionalProxy, makeProxy } from '@/components/util/composition-helpers';
import { SearchProps } from '@/components/molecules/search/type';

export default {
    name: 'PSearch',
    components: { PI },
    directives: { focus },
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
        focused: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        disableIcon: {
            type: Boolean,
            default: false,
        },
        /** sync */
        isFocused: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props: SearchProps, { emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state: any = reactive({
            proxyIsFocused: makeOptionalProxy('isFocused', vm, props.focused),
        });

        const inputListeners = {
            ...listeners,
            input(e) {
                emit('update:value', e.target.value);
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
                if (e.code === 'Enter') emit('search', props.value, e);
                makeByPassListeners(listeners, 'keyup', e);
            },
        };


        return {
            ...toRefs(state),
            slotBind: computed(() => ({
                ...props,
                placeholder: props.placeholder || vm.$t('COMPONENT.SEARCH.PLACEHOLDER'),
                isFocused: state.proxyIsFocused,
                inputListeners,
            })),
            inputListeners,
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

<style lang="postcss">
.p-search {
    @apply flex items-center border border-gray-300 bg-white text-gray-900 px-2 w-full;
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
        height: calc(2rem - 2px);
        &::placeholder {
            @apply text-gray-300;
        }
    }
    .right {
        @apply inline-flex items-center;
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
}


</style>
