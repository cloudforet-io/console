<template>
    <div class="p-search" :class="{ focused: proxyIsFocused }">
        <p-i v-if="!disableIcon && !proxyIsFocused && !value" class="left-icon" name="ic_search"
             color="inherit"
        />
        <slot name="left" v-bind="{ value, placeholder: placeholderText }" />
        <span class="input-wrapper">
            <slot name="default" v-bind="{ value, placeholder: placeholderText }">
                <input v-focus.lazy="proxyIsFocused"
                       :value="value"
                       :placeholder="placeholderText"
                       v-on="inputListeners"
                >
            </slot>
        </span>
        <slot name="right" v-bind="{ value, placeholder: placeholderText }">
            <div class="right">
                <span v-if="value" class="delete-btn" @click="onDelete">
                    <p-i class="icon" name="ic_delete" height="1rem"
                         width="1rem"
                    />
                </span>
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import { focus } from 'vue-focus';
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { makeByPassListeners, makeOptionalProxy } from '@/util/composition-helpers';
import { SearchProps } from '@/inputs/search/search/type';
import { i18n } from '@/translations';

export default defineComponent<SearchProps>({
    name: 'PSearch',
    components: { PI },
    i18n,
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
        const state = reactive({
            proxyIsFocused: makeOptionalProxy('isFocused', vm, false),
            placeholderText: computed(() => {
                if (typeof props.placeholder === 'undefined') return vm.$t('COMPONENT.SEARCH.PLACEHOLDER');
                return props.placeholder;
            }),
        });

        /* event */
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

        const onDelete = () => {
            emit('delete', props.value);
            emit('update:value', '');
        };

        return {
            ...toRefs(state),
            inputListeners,
            onDelete,
        };
    },
});
</script>

<style lang="postcss">
.p-search {
    @apply flex items-center border border-gray-300 bg-white text-gray-900 px-2 w-full rounded;
    height: 2rem;
    line-height: 2rem;
    min-width: 0;
    &.focused, &:focus-within {
        @apply border-secondary bg-blue-100;
    }
    &:hover {
        @apply border-secondary;
    }
    .input-wrapper {
        display: flex;
        flex-grow: 1;
    }
    input {
        @apply border-0 bg-transparent w-full;
        color: inherit;
        font-size: 0.875rem;
        appearance: none;
        height: calc(2rem - 2px);
        &::placeholder {
            @apply text-gray-300;
        }
        &:focus {
            outline: none;
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
