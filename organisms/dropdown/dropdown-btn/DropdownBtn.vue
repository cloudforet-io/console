<template>
    <div class="dropdown-btn-container" :class="{block}">
        <p-button :disabled="disabled"
                  :class="btnClassObject"
                  class="dropdown-btn menu-btn"
                  @click="onClick"
                  @mouseover="onMouseOver"
                  @mouseout="onMouseOut"
        >
            <slot />
        </p-button>
        <p-icon-button class="dropdown-btn dropdown-toggle-split"
                       :class="btnClassObject"
                       :name="popup ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                       :disabled="disabled"
                       :color="`transparent ${ disabled ?
                           colorSets.disabled :
                           (popup || mouseover ? colorSets.popup : colorSets.mouseover)
                       }`"
                       :hover-color="iconHoverColor"
                       button-style="white"
                       @click="onClick"
                       @mouseenter="onMouseOver"
                       @mouseleave="onMouseOut"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import { DropdownBtnProps, dropdownBtnProps } from './PDropdownBtn.toolset';

export default defineComponent({
    name: 'PDropdownBtn',
    components: { PButton, PIconButton },
    props: dropdownBtnProps,
    data() {
        return {
            // Consider to specify color according to Jenny's
            colorSets: {
                disabled: '#A7A9B2',
                popup: '#0080FB',
                mouseover: '#222532',
            },
            mouseover: false,
            iconHoverColor: 'transparent inherit',
        };
    },
    setup(props: DropdownBtnProps, { emit }) {
        const state = reactive({
            mouseover: false,
            iconHoverColor: 'transparent inherit',
            colorSets: {
                disabled: '#A7A9B2',
                popup: '#0080FB',
                mouseover: '#222532',
            },
        });
        return {
            ...toRefs(state),
            btnClassObject: computed(() => ({
                'dropdown-opened': props.popup,
                'dropdown-mouseover': state.mouseover,
                block: props.block,
            })),
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
.dropdown-btn-container {
    display: inline-flex;
    &.block {
        display: flex;
    }
}
.dropdown-btn {
    @apply bg-white border-gray-300;
    border-bottom-width: 1px;
    border-style: solid;
    min-width: 2rem;
    font-weight: normal;
    &:hover {
        @apply text-secondary;
    }
    &.disabled {
        @apply border-gray-300 bg-gray-200 text-gray-400;
    }
    &:not(:disabled):not(.disabled):hover {
        @apply border-secondary bg-white text-secondary;
    }
}
.dropdown-toggle-split {
    min-width: 2rem;
    max-width: 2rem;
    border-radius: 0 2px 2px 0;
}
.menu-btn {
    @apply text-gray-900 border-gray-300;
    min-width: 6.5rem;
    width: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 2px 0 0 2px;
    text-align: left;
    justify-content: flex-start;
    margin-right: -4px;
    &.block {
        width: 100%;
    }
}

.dropdown-mouseover, .dropdown-opened {
    border-color: theme('colors.secondary') !important;
    color: theme('colors.secondary') !important;
}

</style>
