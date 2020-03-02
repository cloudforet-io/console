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
            <p-button class="search-btn"
                      @click="onSearch"
            >
                <p-i color="transparent inherit"
                     width="1.3rem"
                     height="1.3rem"
                     name="ic_search"
                />
            </p-button>
        </div>
    </div>
</template>
<script>
import { focus } from 'vue-focus';
import { computed, ref } from '@vue/composition-api';
import PInputText from '@/components/atoms/inputs/TextInput.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { makeProxy, mouseOverState } from '@/lib/compostion-util';

export default {
    name: 'PSearch',
    events: ['onSearch', 'onDownKey', 'onEscKey'],
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
    setup(props, context) {
        const proxyFocused = (typeof props.focused === 'boolean') ? makeProxy('focused', props, context.emit) : ref(false);
        const { isMouseOver, onMouseOver, onMouseOut } = mouseOverState(props.disabled);
        const bindClass = computed(() => ({ hovered: isMouseOver.value, focused: proxyFocused.value }));
        return {
            proxyFocused,
            onSearch() {
                context.emit('onSearch', props.searchText);
            },
            onMouseOver,
            onMouseOut,
            bindClass,
        };
    },
};
</script>

<style lang="scss" scoped>
    .p-search {
        position: relative;
        display: inline-flex;
        flex-wrap: nowrap;
        width: 100%;
        height: 2rem;
        border: 1px solid $gray2;
        border-radius: 2px;
        background-color: $white;
        &.hovered {
            border-color: $dark;
        }
        &.focused {
            color: $dark;
            border-color: $dark;
        }
        .p-search-input {
            flex-grow: 1;
            border: 0;
            background: transparent;
        }
        .p-search-btn {
            flex-grow: 0;
            .search-btn {
                min-width: 2rem;
            }
        }
    }


</style>
