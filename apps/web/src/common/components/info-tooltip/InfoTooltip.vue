<script setup lang="ts">
import type { TranslateResult } from 'vue-i18n';

import { PTooltip, PI } from '@cloudforet/mirinae';
import type { TooltipPosition } from '@cloudforet/mirinae/types/data-display/tooltips/type';

interface Props {
    tooltipContents: string|TranslateResult;
    tooltipPosition?: TooltipPosition;
    width?: string;
    height?: string;
    color?: string;
    iconName?: string;
}

const props = withDefaults(defineProps<Props>(), {
    tooltipPosition: 'bottom',
    width: '0.75rem',
    height: '0.75rem',
    color: 'inherit',
    iconName: 'ic_info-circle',
});
</script>

<template>
    <p-tooltip class="info-tooltip"
               :contents="props.tooltipContents"
               :position="props.tooltipPosition"
    >
        <p-i :name="props.iconName"
             :height="props.height"
             :width="props.width"
             :color="props.color"
             class="info-tooltip-icon"
        />
    </p-tooltip>
</template>
