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
        <span v-if="isFortAwesome" :style="{color:realIconColor||null}"><i :class="icon.split(' ')" /></span>
        <p-i v-else-if="icon" :name="icon"
             :color="realIconColor ? `transparent ${realIconColor}` : undefined"
             width="1rem" height="1rem"
        />
        <span v-else class="circle" :style="{
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
import PI from '@/components/atoms/icons/PI.vue';
import PLabel from '@/components/atoms/labels/PLabel.vue';
import { computed } from '@vue/composition-api';
import { StatusProps } from '@/components/molecules/status/type';
import { getColor } from '@/components/util/helpers';

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
