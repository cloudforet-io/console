<template>
    <span v-if="theme" class="p-status" :class="theme">
        <span v-if="isFortAwesome" class="fort-awesome"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon" />
        <span v-else class="circle" />
        <p-label class="label">
            {{ text }}
        </p-label>
    </span>
    <span v-else class="p-status">
        <span v-if="isFortAwesome" :style="{color:iconColor||null}"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon" :color="iconStyle" />
        <span v-else class="circle" :style="circleStyle" />
        <p-label class="label" :style="labelStyle">
            {{ text }}
        </p-label>
    </span>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';
import PLabel from '@/components/atoms/labels/PLabel.vue';
import { computed } from '@vue/composition-api';
import { StatusProps } from '@/components/molecules/status/type';

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
        theme: {
            type: String,
            default: null,
        },
    },
    setup(props: StatusProps) {
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
    @define-mixin status-theme $icon-color, $circle-color {
        .fort-awesome {
            color: $icon-color;
        }
        p-i {
            color: $icon-color;
        }
        .circle {
            background-color: $circle-color;
        }
    }
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

        /*theme*/
        &.ENABLED {
            @mixin status-theme theme('colors.green.500'), theme('colors.green.500');
        }
        &.DISABLED {
            @mixin status-theme theme('colors.red.500'), theme('colors.red.500');
        }
    }
</style>
