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
            validator: value => ['white', 'transparent', 'gray900'].indexOf(value) !== -1,
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
        @apply text-gray-400;
        &:hover {
            @apply text-white;
        }
        &.disabled {
            @apply bg-gray-200;
            cursor: unset;
            &:hover {
                color: inherit;
            }
        }
        &.white {
            @apply bg-white border-gray-300;
            &:hover {
                @apply text-gray-200;
            }
        }
        &.gray900 {
            @apply bg-gray-900;
        }
        &:not(:disabled):not(.disabled):hover {
            @apply bg-secondary border-secondary;
        }
        &.transparent {
            &.disabled {
                color: theme('colors.gray.200') !important;;
                border-color: transparent !important;
                background-color: transparent !important;
                cursor: unset;
                &:hover {
                    color: theme('colors.gray.200') !important;;
                }
            }
        }
    }
</style>
