<template>
    <p-pane-layout class="widget-layout">
        <div class="title">
            <span class="mr-2">{{ title }}</span>
            <slot name="help">
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
            <slot name="extra" />
        </div>
        <div :class="{padding}">
            <slot />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import {
    widgetLayoutProps,
    WidgetLayoutPropsType,
} from '@/components/organisms/layouts/widget-layout/WidgetLayout.toolset';

export default defineComponent({
    name: 'PWidgetLayout',
    components: { PPaneLayout, PI, PTooltipButton },
    props: widgetLayoutProps,
    setup(props: WidgetLayoutPropsType) {
        return {};
    },
});
</script>

<style lang="postcss" scoped>
    .widget-layout {
        display: inline-flex;
        flex-direction: column;
        width: 100%;

        .title {
            font-family: theme('fontFamily.sans');
            font-size: 1.125rem;
            line-height: 1.375rem;
            text-transform: uppercase;
            font-weight: bold;
            margin: 1.5rem 1.5rem 1rem 1.5rem;
            display: flex;
            align-items: center;
        }

        .help {
            @apply text-gray-400;
            display: inline-flex;
            cursor: help;
        }

        .padding {
            padding: 0 1.5rem 2.5rem 1.5rem;
        }
    }
</style>
