<template>
    <p-pane-layout class="widget-layout">
        <slot name="top">
            <div class="top">
                <slot name="title">
                    <span class="title" :style="titleStyle">{{ title }}</span>
                </slot>
                <slot name="help" :help="help">
                    <p-tooltip-button v-if="help"
                                      class="help" :tooltip="help"
                                      position="top" theme="gray"
                    >
                        <template #button>
                            <p-i name="ic_tooltip"
                                 width="1rem" height="1rem"
                                 color="inherit transparent"
                            />
                        </template>
                    </p-tooltip-button>
                </slot>
                <div class="flex-grow">
                    <slot name="extra" />
                </div>
            </div>
            <slot v-if="subTitle" name="sub-title">
                <p class="sub-title"> {{ subTitle }}</p>
            </slot>
        </slot>
        <div class="widget-contents">
            <slot />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import PI from '@/foundation/icons/PI.vue';
import PTooltipButton from '@/others/deprecated/tooltip-button/PTooltipButton.vue';
import {
    WidgetLayoutPropsType,
} from '@/others/deprecated/widget-layout/type';

export default {
    name: 'PWidgetLayout',
    components: { PPaneLayout, PI, PTooltipButton },
    props: {
        title: {
            type: String,
            default: '',
        },
        help: {
            type: String,
            default: '',
        },
        titleStyle: {
            type: Object,
            default: () => ({}),
        },
        subTitle: {
            type: String,
            default: '',
        },
    },
    setup(props: WidgetLayoutPropsType) {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout {
    /*@apply border border-gray-100;*/
    display: inline-flex;
    flex-direction: column;
    width: 100%;

    .top {
        @apply flex items-center;
        margin: 2rem 1.5rem 1.5rem 1.5rem;
    }

    .title {
        @apply capitalize font-bold mr-2;
        font-size: 1rem;
        line-height: 120%;
    }

    .sub-title {
        @apply mx-6 text-xs mb-4 text-gray-500;
        margin-top: -1.2rem;
    }

    .help {
        @apply text-gray-400;
        display: inline-flex;
        cursor: help;
    }

    .widget-contents {
        padding: 0 1.5rem 2.5rem 1.5rem;
        flex-grow: 1;
    }
}
</style>
