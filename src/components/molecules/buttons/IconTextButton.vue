<template>
    <p-button
        class="icon-button"
        :class="classObject"
        v-bind="$props"
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
    reactive, computed, toRefs, defineComponent,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';
import color from '@/styles/colors';


export default {
    name: 'PIconTextButton',
    components: { PButton, PI },
    mixins: [ButtonMixin],
    props: {
        name: {
            type: String,
            default: '',
            validator() {
                /**
                 * TODO: CREATE PI.map.js FILE FOR VALIDATION.
                 *       NEED DEFAULT ICON.
                 */
                return true;
            },
        },
        /** @type {string} */
        dir: {
            type: String,
            default: null,
            validator() {
                /**
                 * TODO
                 */
                return true;
            },
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
            classObject: computed(() => [props.buttonStyle]),
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
