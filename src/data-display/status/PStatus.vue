<template>
    <span v-if="theme" class="p-status" :class="theme">
        <p-lottie v-if="lottie" :name="lottie" :size="iconSize" />
        <span v-else-if="isFortAwesome" class="fort-awesome"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon"
             :height="`${iconSize}rem`" :width="`${iconSize}rem`"
        />
        <span v-else-if="!disableIcon" class="circle" />
        <p-label class="label">
            {{ text }}
        </p-label>
    </span>
    <span v-else class="p-status">
        <p-lottie v-if="lottie" :name="lottie" :size="iconSize" />
        <span v-else-if="isFortAwesome" :style="{color:realIconColor||null}"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon"
             :color="realIconColor ? realIconColor : undefined"
             :height="`${iconSize}rem`" :width="`${iconSize}rem`"
        />
        <span v-else-if="!disableIcon" class="circle" :style="{
            backgroundColor: circleColor
        }"
        />
        <p-label class="label" :style="{
            color: labelColor
        }"
        >
            {{ text }}
        </p-label>
    </span>
</template>

<script lang="ts">
import PI from '@/foundation/icons/PI.vue';
import PLabel from '@/inputs/forms/label/PLabel.vue';
import { computed } from '@vue/composition-api';
import { StatusProps } from '@/data-display/status/type';
import { getColor } from '@/util/helpers';
import PLottie from '@/foundation/lottie/PLottie.vue';
import '@/styles/fontawesome.scss';
import { themes } from '@/data-display/status/config';

const fontAwesomePrefix = RegExp('fa-');

export default {
    name: 'PStatus',
    components: { PLottie, PI, PLabel },
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
            validator(theme) {
                return theme === null || themes.includes(theme);
            },
        },
        disableIcon: {
            type: Boolean,
            default: false,
        },
        lottie: {
            type: String,
            default: undefined,
        },
        iconSize: {
            type: Number,
            default: 1,
        },
    },
    setup(props: StatusProps) {
        const labelColor = computed(() => getColor(props.textColor));
        const circleColor = computed(() => getColor(props.iconColor));
        const realIconColor = computed(() => getColor(props.iconColor));
        const isFortAwesome = computed(() => {
            if (props.icon && fontAwesomePrefix.test(props.icon)) {
                return true;
            }
            return false;
        });

        return {
            labelColor,
            circleColor,
            realIconColor,
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
    .p-i {
        color: $icon-color;
    }
    .circle {
        background-color: $icon-color;
    }
    .label {
        color: $circle-color;
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
        margin-right: 0.1rem;
    }
    .label {
        margin: 0;
        margin-left: 0.3rem;
    }

    /* theme */
    &.yellow {
        @mixin status-theme theme('colors.yellow.500'), theme('colors.black');
    }
    &.green {
        @mixin status-theme theme('colors.green.500'), theme('colors.black');
    }
    &.red {
        @mixin status-theme theme('colors.red.500'), theme('colors.red.500');
    }
    &.gray {
        @mixin status-theme theme('colors.gray.500'), theme('colors.gray.500');
    }
}
</style>
