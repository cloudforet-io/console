<script setup lang="ts">
import { onClickOutside } from '@vueuse/core/index';
import {
    reactive, computed, ref,
} from 'vue';

import {
    PI, PIconButton, PPopover, PLink, PEmpty, PContextMenu, useContextMenuController, PDataLoader, PTooltip,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import { WIDGET_WIDTH_STR_MAP } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFrameEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


const props = defineProps<WidgetFrameProps>();
const emit = defineEmits<WidgetFrameEmit>();

const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
    showWidthToggleButton: computed(() => props.widgetSizes.length > 1 && !props.loading && props.mode === 'edit-layout'),
    etcMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'expand',
            label: i18n.t('COMMON.WIDGETS.EXPAND'),
            icon: 'ic_arrows-expand-all',
        },
        {
            type: 'item',
            name: 'edit',
            label: i18n.t('COMMON.WIDGETS.EDIT'),
            icon: 'ic_edit',
        },
        { type: 'divider', name: '' },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('COMMON.WIDGETS.DELETE'),
            icon: 'ic_delete',
        },
    ])),
    sizeDropdownMenuItems: computed<MenuItem[]>(() => props.widgetSizes.map((size) => ({
        type: 'item',
        name: size,
        label: WIDGET_WIDTH_STR_MAP[size],
    }))),
});

const etcButtonRef = ref<HTMLElement|null>(null);
const etcContextMenuRef = ref<any|null>(null);
const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
    toggleContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef: etcButtonRef,
    contextMenuRef: etcContextMenuRef,
    position: 'right',
});
onClickOutside(etcButtonRef, hideContextMenu);

/* Event */
const handleClickEtcButton = () => {
    toggleContextMenu();
};
const handleSelectEtcMenu = (selected: MenuItem) => {
    if (selected.name === 'expand') {
        emit('click-expand');
    } else if (selected.name === 'edit') {
        emit('click-edit');
    } else if (selected.name === 'delete') {
        emit('click-delete');
    }
    hideContextMenu();
};
const handleToggleWidth = () => {
    let nextSize: WidgetSize = WIDGET_SIZE.full;
    if (state.isFull) {
        nextSize = props.widgetSizes.find((size) => size !== WIDGET_SIZE.full) || WIDGET_SIZE.md;
    }
    emit('toggle-size', nextSize);
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
            <p-popover v-if="!props.errorMessage"
                       class="metadata-popover"
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
                            <span class="metadata-value">{{ props.unit || '--' }}</span>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.FULL_DATA_LINK') }}</span>
                            <template v-if="props.fullDataLocation">
                                <p-link new-tab
                                        highlight
                                        action-icon="internal-link"
                                        :to="props.fullDataLocation"
                                        class="metadata-value"
                                >
                                    {{ props.fullDataLinkText }}
                                </p-link>
                            </template>
                            <template v-else>
                                <span class="metadata-value">--</span>
                            </template>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.DESCRIPTION') }}</span>
                            <span class="metadata-value">{{ props.description || '--' }}</span>
                        </div>
                    </div>
                </template>
            </p-popover>
        </div>
        <div v-if="props.mode !== 'overlay'"
             class="action-button-wrapper"
        >
            <p-icon-button ref="etcButtonRef"
                           name="ic_ellipsis-horizontal"
                           style-type="transparent"
                           shape="square"
                           size="sm"
                           @click="handleClickEtcButton"
            />
            <p-context-menu v-show="visibleContextMenu"
                            ref="etcContextMenuRef"
                            class="etc-context-menu"
                            :menu="state.etcMenuItems"
                            :selected="[]"
                            :style="contextMenuStyle"
                            use-fixed-menu-style
                            @select="handleSelectEtcMenu"
            />
        </div>
        <div class="body-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="props.loading"
                           loader-type="skeleton"
                           disable-empty-case
                           :loader-backdrop-opacity="1"
                           show-data-from-scratch
            >
                <div class="h-full">
                    <slot v-if="!props.errorMessage" />
                    <p-empty v-else
                             class="empty-content"
                             :title="$t('COMMON.WIDGETS.UNABLE_TO_LOAD_WIDGET')"
                             :show-image="props.size !== WIDGET_SIZE.sm"
                    >
                        <template #image>
                            <img class="empty-image"
                                 alt="empty-default-image"
                                 src="@/assets/images/img_ghost_no-connection.png"
                            >
                        </template>
                        <p class="empty-text">
                            {{ props.errorMessage }}
                        </p>
                    </p-empty>
                </div>
            </p-data-loader>
        </div>
        <div v-if="state.showWidthToggleButton"
             class="widget-toggle-button-wrapper"
        >
            <p-tooltip :contents="state.isFull ? $t('COMMON.WIDGETS.DEFAULT_WIDTH') : $t('COMMON.WIDGETS.FULL_WIDTH')"
                       position="bottom"
            >
                <p-icon-button style-type="tertiary"
                               :name="state.isFull ? 'ic_arrows-collapse-all' : 'ic_arrows-expand-all'"
                               size="sm"
                               shape="square"
                               class="width-toggle-button"
                               @click="handleToggleWidth"
                />
            </p-tooltip>
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
    &.sm {
        height: 11rem;
    }
    &:hover {
        .action-button-wrapper {
            display: block;
        }
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
            min-height: 6.25rem;
            max-height: 20rem;
            min-width: 20rem;
            max-width: 25rem;
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
        .chart-loader {
            height: 100%;
        }
    }
    .widget-toggle-button-wrapper {
        position: absolute;
        bottom: 0.375rem;
        right: 0.375rem;
        z-index: 100;
    }
    .empty-content {
        height: 100%;
        .empty-image {
            opacity: 50%;
        }
    }
    .action-button-wrapper {
        position: absolute;
        right: 0.25rem;
        top: 0.25rem;
        display: none;
        padding: 0.25rem;
        .etc-context-menu {
            z-index: 1000;
        }
    }
}
</style>
