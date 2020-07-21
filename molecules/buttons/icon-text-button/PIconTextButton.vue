<template>
    <p-button
        class="icon-text-button"
        :style-type="styleType"
        :disabled="disabled"
        :size="size"
        :outline="outline"
        :link="link"
        v-on="$listeners"
        @mouseenter="onHover(true)"
        @mouseleave="onHover(false)"
    >
        <slot v-if="iconDirection === 'right'" name="default" />
        <slot name="icon">
            <p-i
                :class="iconStyleClass"
                :name="name"
                :dir="dir"
                :fill="fill"
                :width="width"
                :height="height"
                :scale="scale"
                :color="iconColor || defaultIconColor"
            />
        </slot>
        <slot v-if="iconDirection === 'left'" name="default" />
    </p-button>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import color from '@/styles/colors';
import { buttonProps } from '@/components/atoms/buttons/PButton.toolset';


export default {
    name: 'PIconTextButton',
    components: { PButton, PI },
    props: {
        ...buttonProps,
        name: {
            type: String,
            default: '',
        },
        /** @type {string} */
        dir: {
            type: String,
            default: null,
        },
        /** @type {boolean} */
        fill: {
            type: Boolean,
            default: true,
        },
        /** @type {string} */
        width: {
            type: String,
            default: '1rem',
        },
        /** @type {string} */
        height: {
            type: String,
            default: '1rem',
        },
        /** @type {string} */
        scale: {
            type: String,
            default: undefined,
        },
        /** @type {string} */
        iconColor: {
            type: String,
            default: undefined,
        },
        /** @type {string} */
        iconDirection: {
            type: String,
            default: 'left',
            validator(value) {
                return ['left', 'right'].indexOf(value) !== -1;
            },
        },
    },
    setup(props: any) {
        const state: any = reactive({
            isHover: false,
        });
        const defaultIconColor = computed(() => {
            if (props.disabled) {
                return color.gray['400'];
            } if (state.isHover) {
                return color.white;
            }
            if (props.outline) {
                return color[props.styleType];
            }
            return color.white;
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
