<template>
    <p-button
        class="icon-button"
        :class="classObject"
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
                :color="iconColor"
                :original="original"
                :title="title"
            />
        </slot>
    </p-button>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs, defineComponent,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

export default defineComponent({
    name: 'PIconButton',
    components: { PButton, PI },
    mixins: [PI],
    props: {
        buttonStyle: {
            type: String,
            default: 'transparent',
            validator: value => ['white', 'transparent', 'dark'].indexOf(value) !== -1,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        hoverColor: {
            type: String,
            default: 'transparent inherit',
        },
        disabledColor: {
            type: String,
            default: 'transparent inherit',
        },
    },
    setup(props: any) {
        const state: any = reactive({
            isHover: false,
            classObject: computed(() => [props.buttonStyle]),
        });
        const iconColor = computed(() => {
            if (props.disabled) {
                return props.disabledColor;
            } if (state.isHover) {
                return props.hoverColor;
            }
            return props.color;
        });
        const onHover = (value) => {
            state.isHover = value;
        };
        return {
            ...toRefs(state),
            iconColor,
            onHover,

        };
    },
});
</script>

<style lang="postcss" scoped>
    .icon-button {
        border-radius: 2px;
        padding: 0px;
        display: inline-flex;
        justify-content: center;
        align-content: center;
        min-width: 2rem;
        max-width: 2rem;
        min-height: 2rem;
        max-height: 2rem;
        @apply text-gray1;
        &:hover {
            @apply text-white;
        }
        &.disabled {
            @apply bg-gray2;
            cursor: unset;
            &:hover {
                color: inherit;
            }
        }
        &.white {
            @apply bg-white border-gray2;
            &:hover {
                @apply text-gray2;
            }
        }
        &.dark {
            @Qapply bg-dark;
        }
        &:not(:disabled):not(.disabled):hover {
            @apply bg-secondary border-secondary;
        }
        &.transparent {
            &.disabled {
                @apply text-gray2;
                border-color: transparent;
                background-color: transparent;
                cursor: unset;
                &:hover {
                    @apply text-gray2;
                }
            }
        }
    }
</style>
