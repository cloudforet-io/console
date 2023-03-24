<template>
    <p-pane-layout class="widget-layout">
        <slot name="title">
            <p class="title">
                {{ title }}
            </p>
        </slot>
        <div class="widget-contents"
             :style="{overflow}"
        >
            <slot />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'WidgetLayout',
    components: { PPaneLayout },
    props: {
        title: {
            type: String,
            default: '',
        },
        overflow: {
            type: String,
            default: 'visible',
        },
    },
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout {
    @apply border-0 rounded-lg;
    display: inline-flex;
    flex-direction: column;
    width: 100%;
    padding: 1.25rem;
    .title {
        @apply text-gray-900;
        font-size: 1.125rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .widget-contents {
        flex-grow: 1;
        height: 100%;
    }
}
</style>
