<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';


interface WidgetFrameProps {
    title?: TranslateResult;
    size?: WidgetSize;
    width?: number;
    widgetLocation?: Location;
    widgetConfigId?: string;
    // noData?: boolean;
    // editMode?: boolean;
    // errorMode?: boolean;
    // widgetKey: string;
}

const props = withDefaults(defineProps<WidgetFrameProps>(), {
    title: undefined,
    size: WIDGET_SIZE.full,
    width: undefined,
    widgetLink: undefined,
    widgetLocation: undefined,
    widgetConfigId: undefined,
});

// const emit = defineEmits<{(event: 'click-delete'): void;
//     (event: 'click-expand'): void;
//     (event: 'click-edit'): void;
// }>();

const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
});
</script>

<template>
    <div class="widget-frame"
         :class="{ full: state.isFull }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ props.title }}
            </h3>
        </div>
        <div class="body">
            <slot />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-frame {
    position: relative;
    height: 22.5rem;

    @apply rounded-lg bg-white;
    border-color: theme('colors.gray.200');
    display: inline-flex;
    flex-direction: column;
    padding: 1rem;

    .widget-header {
        @apply flex items-center;
        .title {
            @apply truncate text-label-md;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            -webkit-box-orient: vertical;
            font-weight: 500;
            padding-right: 0.5rem;
        }

        padding-bottom: 0.5rem;
    }
    .body {
        height: auto;
        overflow-y: auto;
        flex: 1 1;
        padding: 0 1.5rem;
    }
    .error-container {
        @apply flex items-center flex-col h-full;
        padding: 0 1.5625rem;

        .error-title {
            @apply text-gray-700 flex justify-center items-center;
            font-size: 1.125rem;
            height: 42%;
            .error-icon-wrapper {
                @apply text-red-400;
                padding-right: 0.5rem;
            }
        }
        .error-message {
            @apply text-gray-700;
            text-align: center;
            margin-top: 2rem;
            line-height: 1.25;
            font-size: 0.875rem;
        }
        .edit-button {
            z-index: 1;
            margin: 1rem 0;
        }
    }
    &.full {
        height: auto;
    }
}
</style>
