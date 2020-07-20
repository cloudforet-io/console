<template>
    <div class="p-dropdown-btn" :class="{block, 'button-only': buttonOnly}">
        <p-button v-if="!buttonOnly"
                  :disabled="disabled"
                  class="menu-btn"
                  :class="{active: popup, hovered: mouseover}"
                  @click="onClick"
                  @mouseover="onMouseOver"
                  @mouseout="onMouseOut"
        >
            <slot name="default" />
        </p-button>
        <slot name="icon">
            <p-icon-button :name="buttonIcon || (popup ? 'ic_arrow_top' : 'ic_arrow_bottom')"
                           :class="{active: popup, hovered: mouseover}"
                           :style-type="buttonStyleType"
                           :disabled="disabled"
                           :outline="true"
                           @click="onClick"
                           @mouseenter="onMouseOver"
                           @mouseleave="onMouseOut"
            />
        </slot>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { DropdownBtnProps, dropdownBtnProps } from './PDropdownBtn.toolset';

export default defineComponent({
    name: 'PDropdownBtn',
    components: { PButton, PIconButton },
    props: dropdownBtnProps,
    setup(props: DropdownBtnProps, { emit }) {
        const state = reactive({
            mouseover: false,
        });
        return {
            ...toRefs(state),
            onClick(event): void {
                emit('click', event);
                emit('update:popup', !props.popup);
            },
            onMouseOver(): void {
                if (!props.disabled) state.mouseover = true;
            },
            onMouseOut(): void {
                if (!props.disabled) state.mouseover = false;
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
.p-dropdown-btn {
    display: inline-flex;
    min-width: 6.5rem;
    &.button-only {
        min-width: unset;
    }
    &.block {
        display: flex;
    }
}

.menu-btn.p-button {
    @apply border-gray-300 text-gray-900 px-4 justify-start text-left flex-grow font-normal;
    width: auto;
    min-width: unset;
    margin-right: -1px;
    border-radius: 2px 0 0 2px;
    &:not(.active).hovered {
        @apply border-gray-900;
    }
    &.active {
        @apply border-secondary text-secondary;
    }
}

.p-icon-button.p-button.outline {
    @apply flex-shrink-0;
    &:not(.active).hovered {
        @apply border-gray-900;
    }
    &:not(.disabled):hover {
        border-color: unset;
        background-color: unset;
        color: unset;
    }
    &.active {
        @apply border-secondary text-secondary;
        &:hover {
            @apply border-secondary text-secondary;
        }
    }
}
</style>
