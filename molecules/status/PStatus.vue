<template>
    <span class="p-status">
        <span v-if="isFortAwesome" :style="{color:iconColor||null}"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon" :color="iconStyle" />
        <span v-else class="circle" :style="circleStyle" />
        <p-label class="label" :style="labelStyle">
            {{ text }}
        </p-label>
    </span>
</template>

<script>
import PI from '@/components/atoms/icons/PI.vue';
import PLabel from '@/components/atoms/labels/PLabel.vue';
import { computed } from '@vue/composition-api';

const fontAwesomePrefix = RegExp('fa-');
export default {
    name: 'PStatus',
    components: { PI, PLabel },
    props: {
        icon: {
            type: String,
            default: null,
        },
        text: {
            type: String,
            default: null,
        },
        textColor: {
            type: String,
            default: null,
        },
        iconColor: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const labelStyle = computed(() => (props.textColor ? { color: props.textColor } : null));
        const circleStyle = computed(() => (props.iconColor ? { backgroundColor: props.iconColor } : null));
        const iconStyle = computed(() => (props.iconColor ? `transparent ${props.iconColor}` : null));
        const isFortAwesome = computed(() => {
            if (props.icon && fontAwesomePrefix.test(props.icon)) {
                return true;
            }
            return false;
        });

        return {
            labelStyle,
            circleStyle,
            iconStyle,
            isFortAwesome,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        .circle {
            border-radius: 50%;
            height: 0.5rem;
            width: 0.5rem;
        }
        .label {
            margin: 0;
            padding-left: .5rem;
        }
    }
</style>
