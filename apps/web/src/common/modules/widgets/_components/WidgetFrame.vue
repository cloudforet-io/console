<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';

import {
    PI, PIconButton, PPopover, PSelectDropdown, PLink,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';

import { WIDGET_WIDTH_STR_MAP } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


const props = withDefaults(defineProps<WidgetFrameProps>(), {
});
const emit = defineEmits<{(event: 'click-delete'): void;
    (event: 'click-edit'): void;
    (event: 'update-size', size: WidgetSize): void;
}>();

const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
    sizeDropdownMenuItems: computed<MenuItem[]>(() => props.widgetSizes.map((size) => ({
        type: 'item',
        name: size,
        label: WIDGET_WIDTH_STR_MAP[size],
    }))),
});

/* Event */
const handleEditButtonClick = () => {
    emit('click-edit');
};
const handleClickDeleteButton = () => {
    emit('click-delete');
};
const handleSelectSize = (size: WidgetSize) => {
    emit('update-size', size);
};
</script>

<template>
    <div class="widget-frame"
         :class="{ full: state.isFull, [props.size]: props.size }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ props.title }}
            </h3>
            <p-popover class="metric-select-guide-popover"
                       position="bottom-start"
                       :trigger="POPOVER_TRIGGER.CLICK"
            >
                <div class="metadata-button">
                    <p-i name="ic_info-circle"
                         width="1rem"
                         height="1rem"
                    />
                    <span class="metadata-text">{{ $t('DASHBOARDS.WIDGET.METADATA') }}</span>
                </div>
                <template #content>
                    <div class="metadata-content">
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.BASED_ON') }}</span>
                            <span class="metadata-value">{{ props.basedOnText }}</span>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.UNIT') }}</span>
                            <span class="metadata-value">$USD</span>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.FULL_DATA_LINK') }}</span>
                            <p-link new-tab
                                    highlight
                                    action-icon="internal-link"
                                    :to="{}"
                                    class="metadata-value"
                            >
                                Storage Data
                            </p-link>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.DESCRIPTION') }}</span>
                            <span class="metadata-value">Description</span>
                        </div>
                    </div>
                </template>
            </p-popover>
        </div>
        <div v-if="props.mode === 'view'"
             class="action-button-wrapper"
        >
            <p-icon-button name="ic_edit"
                           style-type="transparent"
                           size="sm"
                           @click="handleEditButtonClick"
            />
            <p-icon-button name="ic_delete"
                           style-type="transparent"
                           size="sm"
                           @click="handleClickDeleteButton"
            />
        </div>
        <div class="body-wrapper">
            <slot />
        </div>
        <p-select-dropdown v-if="state.sizeDropdownMenuItems.length > 1"
                           class="widget-size-dropdown"
                           style-type="transparent"
                           :menu="state.sizeDropdownMenuItems"
                           :selected="props.size"
                           use-fixed-menu-style
                           @select="handleSelectSize"
        />
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
    &.sm {
        height: 11rem;
    }

    .widget-header {
        display: flex;
        align-items: center;
        padding-bottom: 0.5rem;
        .title {
            @apply truncate text-label-md;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            -webkit-box-orient: vertical;
            font-weight: 500;
        }
        .metadata-button {
            @apply text-gray-700;
            display: flex;
            align-items: center;
            cursor: pointer;
            padding-left: 0.75rem;
            .metadata-text {
                @apply text-label-sm;
                padding-left: 0.25rem;
            }
        }
        .metadata-content {
            @apply text-label-md;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: 20rem;
            overflow-y: auto;
            z-index: 100;
            padding-top: 0.5rem;
            .metadata-item-row {
                display: flex;
                justify-content: flex-start;
                gap: 2rem;
                .metadata-title {
                    @apply text-gray-600;
                    width: 7rem;
                }
            }
        }
    }
    .body-wrapper {
        height: 100%;
    }
    .action-button-wrapper {
        @apply bg-gray-150 rounded-lg;
        position: absolute;
        right: 0.25rem;
        top: 0.25rem;
        padding: 0.25rem;
    }
    .body {
        height: auto;
        flex: 1 1;
        padding: 0 1.5rem;
    }
    .widget-size-dropdown {
        position: absolute;
        bottom: 0;
        right: 0;
    }
}
</style>
