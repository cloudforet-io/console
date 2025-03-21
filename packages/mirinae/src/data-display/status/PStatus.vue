<template>
    <span class="p-status"
          :class="[theme]"
          v-on="$listeners"
    >
        <template v-if="theme">
            <p-i v-if="icon"
                 :name="icon"
                 :height="`${iconSize}rem`"
                 :width="`${iconSize}rem`"
                 :animation="iconAnimation"
            />
            <span v-else-if="!disableIcon"
                  class="circle"
            />
            <span class="text"><slot>{{ text }}</slot></span>
        </template>
        <template v-else>
            <p-i v-if="icon"
                 :name="icon"
                 :color="realIconColor ? realIconColor : undefined"
                 :animation="iconAnimation"
                 :height="`${iconSize}rem`"
                 :width="`${iconSize}rem`"
            />
            <span v-else-if="!disableIcon"
                  class="circle"
                  :style="{
                      backgroundColor: circleColor
                  }"
            />
            <span class="text"
                  :style="{
                      color: labelColor
                  }"
            >
                <slot>{{ text }}</slot>
            </span>
        </template>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import type { StatusTheme } from '@/data-display/status/type';
import type { AnimationType } from '@/foundation/icons/config';
import PI from '@/foundation/icons/PI.vue';
import { getColor } from '@/utils/helpers';

export default defineComponent({
    name: 'PStatus',
    components: { PI },
    props: {
        icon: {
            type: String as PropType<string|null|undefined>,
            default: null,
        },
        text: {
            type: String as PropType<TranslateResult|null|undefined>,
            default: null,
        },
        textColor: {
            type: String as PropType<string|null>,
            default: null,
        },
        iconColor: {
            type: String as PropType<string|null>,
            default: null,
        },
        theme: {
            type: String as PropType<StatusTheme|null>,
            default: null,
        },
        disableIcon: {
            type: Boolean,
            default: false,
        },
        iconSize: {
            type: Number,
            default: 1,
        },
        iconAnimation: {
            type: String as PropType<AnimationType>,
            default: undefined,
        },
    },
    setup(props) {
        const labelColor = computed(() => getColor(props.textColor));
        const circleColor = computed(() => getColor(props.iconColor));
        const realIconColor = computed(() => getColor(props.iconColor));
        return {
            labelColor,
            circleColor,
            realIconColor,
        };
    },
});
</script>

<style lang="postcss">
.p-status {
    @define-mixin status-theme $icon-color, $circle-color {
        .p-i {
            color: $icon-color;
        }
        .circle {
            background-color: $icon-color;
        }
        .text {
            color: $circle-color;
        }
    }
    display: inline-flex;
    align-items: center;
    justify-content: center;
    .circle {
        @apply rounded-full;
        height: 0.5rem;
        width: 0.5rem;
        margin-right: 0.1rem;
    }
    .text {
        margin: 0;
        margin-left: 0.3rem;
    }

    /* theme */
    &.yellow {
        @mixin status-theme theme('colors.yellow.500'), theme('colors.black');
    }
    &.green {
        @mixin status-theme theme('colors.green.600'), theme('colors.black');
    }
    &.red {
        @mixin status-theme theme('colors.red.500'), theme('colors.red.500');
    }
    &.gray {
        @mixin status-theme theme('colors.gray.500'), theme('colors.gray.500');
    }
}
</style>
