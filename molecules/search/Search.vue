<template>
    <div class="p-search" :class="bindClass">
        <p-input-text v-focus.lazy="proxyFocused"
                      class="p-search-input"
                      :value="searchText"
                      :disabled="disabled"
                      :placeholder="searchPlaceholder"
                      @input="$emit('update:searchText',$event)"
                      @keyup.enter="onSearch"
                      @keyup.down="$emit('onDownKey',$event)"
                      @keyup.esc="$emit('onEscKey',$event)"
                      @focus="proxyFocused = true"
                      @blur="proxyFocused = false"
                      @mouseover="onMouseOver"
                      @mouseout="onMouseOut"
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
