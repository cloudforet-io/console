<template>
    <div>
        <p-tooltip :contents="tooltip" :position="position" :options="options"
                   v-on="$listeners"
        >
            <template #target>
                <span>
                    <slot name="button" :active="active">
                        <p-button ref="button" class="tooltip-btn" :class="{active: active}"
                                  @click="onClick"
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
import PTooltip from '@/components/molecules/tooltips/Tooltip';
import PButton from '@/components/atoms/buttons/Button';

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
    },
    computed: {
        options() {
            return this._.merge({
                hideOnTargetClick: true,
            }, this.tooltipOptions);
        },
    },
    methods: {
        onClick() {
        },
    },
};
</script>

<style scoped lang="scss">
    .tooltip-btn {
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        border: 0px;
        min-width: 32px;
        color: $primary4;
        &:hover, &.active {
            background-color: $primary-dark;
        }
    }
</style>
