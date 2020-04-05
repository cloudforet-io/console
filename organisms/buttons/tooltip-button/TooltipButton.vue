<template>
    <div>
        <p-tooltip :contents="tooltip" :position="position" :options="options"
                   v-on="$listeners"
        >
            <template #target>
                <span>
                    <slot name="button" :active="active">
                        <p-button ref="button" class="tooltip-btn" :class="{
                            active: active,
                            [theme]: true
                        }"
                        >
                            <slot name="buttonContents">
                                {{ contents }}
                            </slot>
                        </p-button>
                    </slot>
                </span>
            </template>
        </p-tooltip>
    </div>
</template>

<script>
import _ from 'lodash';
import PTooltip from '@/components/molecules/tooltips/Tooltip.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

export default {
    name: 'PTooltipButton',
    events: ['click'],
    components: {
        PTooltip,
        PButton,
    },
    props: {
        contents: {
            type: String,
            default: null,
        },
        tooltip: {
            type: String,
            default: null,
        },
        tooltipOptions: {
            type: Object,
            default: () => ({}),
        },
        position: {
            type: String,
            default: 'right',
        },
        active: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            default: 'primary-dark',
            validator(theme) {
                return ['primary-dark', 'transparent'];
            },
        },
    },
    computed: {
        options() {
            return _.merge({
                hideOnTargetClick: true,
            }, this.tooltipOptions);
        },
    },
};
</script>

<style scoped lang="postcss">

    @define-mixin theme $theme, $color {
        &.$(theme) {
            &:hover, &.active {
                background-color: $color;
            }
        }
    }
    .tooltip-btn {
        @apply text-primary4;
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        border: 0;
        min-width: 32px;

        @mixin theme primary-dark, theme('colors.primary-dark');
        @mixin theme transparent, transparent;
    }


</style>
