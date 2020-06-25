<template>
    <div class="p-search" :class="bindClass">
        <p-input-text v-focus.lazy="proxyFocused"
                      class="p-search-input"
                      :value="searchText"
                      :disabled="disabled"
                      :placeholder="searchPlaceholder"
                      v-on="inputListeners"
        />
        <div class="p-search-btn"
             @mouseover="onMouseOver"
             @mouseout="onMouseOut"
        >
            <slot name="search" v-bind="{...$props, focused: proxyFocused, hovered: isMouseOver }">
                <p-button class="search-btn"
                          @click="onSearch"
                >
                    <p-i
                        width="1.5rem"
                        height="1.5rem"
                        name="ic_search"
                    />
                </p-button>
            </slot>
        </div>
    </div>
</template>
<script lang="ts">
import { focus } from 'vue-focus';
import { computed, getCurrentInstance, ref } from '@vue/composition-api';
import PInputText from '@/components/atoms/inputs/TextInput.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { makeProxy, mouseOverState } from '@/lib/compostion-util';

export default {
    name: 'PSearch',
    directives: { focus },
    components: {
        PButton,
        PInputText,
        PI,
    },
    props: {
        searchText: {
            type: String,
        },
        searchPlaceholder: {
            type: String,
            default: 'Please, Place any String',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        focused: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const proxyFocused = (typeof props.focused === 'boolean') ? makeProxy('focused', props, emit) : ref(false);
        const { isMouseOver, onMouseOver, onMouseOut } = mouseOverState(props.disabled);
        const bindClass = computed(() => ({ hovered: isMouseOver.value, focused: proxyFocused.value }));
        const onSearch = () => {
            emit('onSearch', props.searchText);
        };
        const vm: any = getCurrentInstance();
        return {
            proxyFocused,
            onSearch,
            onMouseOver,
            onMouseOut,
            bindClass,
            isMouseOver,
            inputListeners: computed(() => ({
                ...vm.$listeners,
                input(e) {
                    emit('update:searchText', e);
                    if (vm.$listeners.input) vm.$listeners.input(e);
                },
                'keyup.enter': (e) => {
                    onSearch();
                    if (vm.$listeners['keyup.enter']) vm.$listeners['keyup.enter'](e);
                },
                'keyup.down': (e) => {
                    emit('onDownKey', e);
                    if (vm.$listeners['keyup.down']) vm.$listeners['keyup.down'](e);
                },
                'keyup.esc': (e) => {
                    emit('onEscKey', e);
                    if (vm.$listeners['keyup.esc']) vm.$listeners['keyup.esc'](e);
                },
                focus(e) {
                    proxyFocused.value = true;
                    if (vm.$listeners.focus) vm.$listeners.focus(e);
                },
                blur(e) {
                    proxyFocused.value = false;
                    if (vm.$listeners.blur) vm.$listeners.blur(e);
                },
                mouseover(e) {
                    if (vm.$listeners.mouseover) vm.$listeners.mouseover(e);
                    else onMouseOver();
                },
                mouseout(e) {
                    if (vm.$listeners.mouseout) vm.$listeners.mouseout(e);
                    else onMouseOut();
                },

            })),
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-search {
        @apply border border-gray-300 bg-white flex-no-wrap inline-flex w-full h-8 relative rounded-sm;
        .p-search-input {
            @apply w-full flex-grow border-0;
            background: transparent;
        }
        .p-search-btn {
            @apply flex-grow-0;
            .search-btn {
                @apply min-w-8 p-0 h-full;
                &:hover{
                    @apply bg-blue-300;
                }
            }
        }

        &.hovered {
            @apply border-secondary text-secondary;
        }
        &.focused {
            @apply border-secondary text-secondary bg-secondary2 ;
            .p-search-input {
                @apply text-secondary;
            }
        }

    }


</style>
