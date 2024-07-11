<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';

import {
    PI, PIconButton, PPopover, PLink, PEmpty, PTooltip, PSkeleton, PSelectDropdown, PButton,
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
        ...(props.disableManageButtons ? [] : [{
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
        }] as MenuItem[]),
    ])),
    etcMenuVisible: false,
    sizeDropdownMenuItems: computed<MenuItem[]>(() => props.widgetSizes.map((size) => ({
        type: 'item',
        name: size,
        label: WIDGET_WIDTH_STR_MAP[size],
    }))),
});

/* Event */
const handleSelectEtcMenu = (selected: MenuItem) => {
    if (selected.name === 'expand') {
        emit('click-expand');
    } else if (selected.name === 'edit') {
        emit('click-edit');
    } else if (selected.name === 'delete') {
        emit('click-delete');
    }
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
            <p-popover v-if="!props.errorMessage && props.widgetState === 'ACTIVE'"
                       class="metadata-popover"
                       position="bottom-start"
                       :trigger="POPOVER_TRIGGER.CLICK"
            >
                <div class="metadata-button">
                    <p-i name="ic_info-circle"
                         width="0.75rem"
                         height="0.75rem"
                    />
                </div>
                <template #content>
                    <div class="metadata-content">
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('COMMON.WIDGETS.PERIOD') }}</span>
                            <span>{{ props.periodText }}</span>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.UNIT') }}</span>
                            <span>{{ props.unit || '--' }}</span>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.FULL_DATA_LINK') }}</span>
                            <template v-if="props.fullDataLinkList?.length">
                                <div class="full-data-link-wrapper">
                                    <p-link v-for="fullDataLink in props.fullDataLinkList"
                                            :key="`${fullDataLink?.name}-${fullDataLink?.location}`"
                                            new-tab
                                            highlight
                                            action-icon="internal-link"
                                            :to="fullDataLink?.location"
                                    >
                                        {{ fullDataLink?.name }}
                                    </p-link>
                                </div>
                            </template>
                            <template v-else>
                                <span>--</span>
                            </template>
                        </div>
                        <div class="metadata-item-row">
                            <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.DESCRIPTION') }}</span>
                            <div class="description">
                                {{ props.description || '--' }}
                            </div>
                        </div>
                    </div>
                </template>
            </p-popover>
        </div>
        <div v-if="props.mode !== 'overlay'"
             class="action-button-wrapper"
             :class="{ 'selected': state.etcMenuVisible }"
        >
            <p-select-dropdown style-type="tertiary-icon-button"
                               button-icon="ic_ellipsis-horizontal"
                               class="etc-button"
                               :menu="state.etcMenuItems"
                               :selected="[]"
                               :visible-menu.sync="state.etcMenuVisible"
                               size="sm"
                               menu-position="right"
                               reset-selection-on-menu-close
                               @select="handleSelectEtcMenu"
            />
        </div>
        <div class="body-wrapper">
            <p-skeleton v-if="props.loading"
                        width="100%"
                        height="100%"
            />
            <p-empty v-else-if="props.widgetState === 'INACTIVE'"
                     class="empty-content"
                     :title="$t('COMMON.WIDGETS.DATA_NOT_DISPLAYED')"
                     :show-image="props.size !== WIDGET_SIZE.sm"
                     :show-button="props.mode === 'view'"
            >
                <template #image>
                    <img class="empty-image"
                         alt="need-to-apply-image"
                         src="@/assets/images/img_star-need-apply.svg"
                    >
                </template>
                <p class="empty-text">
                    {{ $t('COMMON.WIDGETS.DATA_NOT_DISPLAYED_DESC') }}
                </p>
                <template #button>
                    <p-button style-type="substitutive"
                              size="sm"
                              @click="() => emit('click-edit')"
                    >
                        {{ $t('COMMON.WIDGETS.EDIT_WIDGET') }}
                    </p-button>
                </template>
            </p-empty>
            <p-empty v-else-if="props.errorMessage"
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
                    {{ !props.dataTableId ? $t('COMMON.WIDGETS.SELECT_A_DATA_TABLE') : props.errorMessage }}
                </p>
            </p-empty>
            <div v-else-if="props.noData"
                 class="no-data-content"
            >
                <span>{{ $t('COMMON.WIDGETS.NO_DATA_TO_DISPLAY') }}</span>
            </div>
            <slot v-else />
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
        height: 1.625rem;
        padding-bottom: 0.5rem;
        .title {
            @apply truncate text-label-md;
            max-width: 90%;
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
        }
        .metadata-content {
            @apply text-label-md;
            display: flex;
            line-height: unset;
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
                .metadata-title {
                    @apply text-gray-600;
                    width: 7rem;
                }
                .full-data-link-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }
                .description {
                    @apply text-gray-700;
                    max-width: 18rem;
                    display: block;
                }
            }
        }
    }
    .body-wrapper {
        height: calc(100% - 1.5rem);
        .chart-loader {
            height: 100%;
        }
    }
    .no-data-content {
        @apply text-paragraph-md text-gray-300;
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
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
        &.selected {
            display: block;
        }
    }
}
</style>
