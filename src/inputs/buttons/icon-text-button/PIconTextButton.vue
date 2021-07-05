<template>
    <p-button class="p-icon-text-button"
              :style-type="styleType"
              :disabled="disabled"
              :size="size"
              :outline="outline"
              :href="href"
              :block="block"
              :font-weight="fontWeight"
              v-on="$listeners"
              @mouseenter="onHover(true)"
              @mouseleave="onHover(false)"
    >
        <slot v-if="iconDirection === 'right'" name="default" />
        <slot name="icon">
            <p-i :class="iconStyleClass"
                 :name="name"
                 :dir="dir"
                 :fill="fill"
                 :width="width"
                 :height="height"
                 :scale="scale"
                 :color="iconColor || defaultIconColor"
                 class="flex-shrink-0"
            />
        </slot>
        <slot v-if="iconDirection === 'left'" name="default" />
    </p-button>
</template>

<script lang="ts">
import { reactive, computed, toRefs } from '@vue/composition-api';

import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { IconTextButtonProps } from '@/inputs/buttons/icon-text-button/type';
import { BUTTON_FONT_WEIGHT, BUTTON_SIZE, BUTTON_STYLE } from '@/inputs/buttons/button/type';

import { palette } from '@/styles/colors';

export default {
    name: 'PIconTextButton',
    components: { PButton, PI },
    props: {
        href: {
            type: String,
            default: undefined,
        },
        size: {
            type: String,
            default: undefined,
            validator(value) {
                return [
                    undefined,
                    ...Object.keys(BUTTON_SIZE),
                ].indexOf(value) !== -1;
            },
        },
        iconColor: {
            type: String,
            default: undefined,
        },
        iconDirection: {
            type: String,
            default: 'left',
            validator(value) {
                return ['left', 'right'].indexOf(value) !== -1;
            },
        },
        //
        name: {
            type: String,
            default: '',
        },
        dir: {
            type: String,
            default: null,
        },
        fill: {
            type: Boolean,
            default: true,
        },
        width: {
            type: String,
            default: '1rem',
        },
        height: {
            type: String,
            default: '1rem',
        },
        scale: {
            type: String,
            default: undefined,
        },
        styleType: {
            type: String,
            default: undefined,
            validator(value) {
                if (value === undefined) return true;
                return Object.keys(BUTTON_STYLE).indexOf(value) !== -1;
            },
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
        fontWeight: {
            type: String,
            default: 'bold',
            validator(value) {
                if (value === undefined) return true;
                return Object.keys(BUTTON_FONT_WEIGHT).indexOf(value) !== -1;
            },
        },
    },
    setup(props: IconTextButtonProps) {
        const state = reactive({
            isHover: false,
        });
        const defaultIconColor = computed(() => {
            if (props.disabled) {
                return palette.gray[300];
            }
            return 'inherit';
        });
        const onHover = (value) => {
            state.isHover = value;
        };
        const iconStyleClass = computed(() => {
            const cls = {};
            cls[`btn${props.outline ? '-outline' : ''}-${props.styleType}`] = true;
            if (props.iconDirection === 'left') {
                cls['mr-1'] = true;
            } else {
                cls['ml-1'] = true;
            }
            return cls;
        });
        return {
            ...toRefs(state),
            defaultIconColor,
            onHover,
            iconStyleClass,

        };
    },
};
</script>

<style lang="postcss">
.p-icon-text-button {
    @apply inline-flex items-center truncate;
}
</style>
