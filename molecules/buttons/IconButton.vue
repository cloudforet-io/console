<template>
    <p-button
        class="p-icon-button"
        :class="{solid, [`icon-btn-${styleType}`]: !!styleType}"
        :outline="outline"
        :disabled="disabled"
        v-on="$listeners"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)"
    >
        <slot>
            <p-i
                :name="name"
                :dir="dir"
                :fill="fill"
                :width="width"
                :height="height"
                :scale="scale"
                :color="color"
                :original="original"
                :title="title"
            />
        </slot>
    </p-button>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { iconProps } from '@/components/atoms/icons/PI.toolset';
import { iconButtonProps } from '@/components/molecules/buttons/PIconButton.toolset';

export default {
    name: 'PIconButton',
    components: { PButton, PI },
    props: iconButtonProps,
    setup(props: any) {
        const state: any = reactive({
            isHover: false,
        });
        const onHover = (value) => {
            state.isHover = value;
        };
        return {
            ...toRefs(state),
            onHover,

        };
    },
};
</script>

<style lang="postcss" scoped>
    @define-mixin button-style
    $solid-bg-color, $solid-text-color, $outline-border-color, $outline-text-color {
        color: $outline-text-color;

        &.solid {
            border-radius: 2px;
            background-color: $solid-bg-color;
            border-color: transparent;
            color: $solid-text-color;
        }

        &.outline {
            border-radius: 2px;
            background-color: transparent;
            border-color: $outline-border-color;
            color: $outline-text-color;
        }
    }

.p-icon-button {
    @apply rounded-sm p-0 inline-flex justify-center items-center;
    min-width: 2rem;
    max-width: 2rem;
    min-height: 2rem;
    max-height: 2rem;

    &.p-button {
        background-color: transparent;
        border-color: transparent;
        border-radius: 50px;

        &.outline {
            border-color: theme('colors.gray.300');
            color: theme('colors.gray.900');
            &.disabled {
                background-color: theme('colors.gray.100');
                border-color: theme('colors.gray.100');
            }
        }

        &.disabled {
            cursor: unset;
            color: theme('colors.gray.300');
        }

        &:not(.disabled):hover {
            background-color: theme('colors.blue.200');
            border-color: theme('colors.blue.200');
            color: theme('colors.secondary');
        }

        &.solid, &.outline {
            &:not(.disabled):hover {
                background-color: theme('colors.blue.200');
                border-color: theme('colors.blue.200');
                color: theme('colors.secondary');
            }
        }


        /* default */
        @mixin button-style
        theme('colors.gray.900'), theme('colors.white'),
        theme('colors.gray.300'), theme('colors.gray.900');

        /* themes */
        &.icon-btn-primary-dark {
            @mixin button-style
            theme('colors.primary-dark'), theme('colors.white'),
            theme('colors.primary-dark'), theme('colors.primary-dark');
        }
    }
}
</style>
