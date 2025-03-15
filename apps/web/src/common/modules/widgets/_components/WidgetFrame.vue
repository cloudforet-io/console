<script setup lang="ts">
import {
    reactive, computed, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PIconButton, PPopover, PLink, PEmpty, PTooltip, PSkeleton, PSelectDropdown, PButton, PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { WIDGET_SIZE } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetSize } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import { WIDGET_WIDTH_STR_MAP } from '@/common/modules/widgets/_constants/widget-display-constant';
import { WIDGET_HEIGHT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetHeightValue } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { WidgetEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


const props = defineProps<WidgetFrameProps>();
const emit = defineEmits<WidgetEmit>();
const router = useRouter();
const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
    showWidthToggleButton: computed(() => props.widgetSizes.length > 1 && !props.loading && props.mode === 'edit-layout'),
    etcMenuItems: computed<MenuItem[]>(() => ([
        ...(props.disableManageButtons ? [] : [{
            type: 'item',
            name: 'edit',
            label: i18n.t('COMMON.WIDGETS.EDIT'),
            icon: 'ic_edit',
        },
        {
            type: 'item',
            name: 'clone',
            label: i18n.t('COMMON.WIDGETS.CLONE'),
            icon: 'ic_clone',
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
    popperVisible: false,
    sizeDropdownMenuItems: computed<MenuItem[]>(() => props.widgetSizes.map((size) => ({
        type: 'item',
        name: size,
        label: WIDGET_WIDTH_STR_MAP[size],
    }))),
    unitText: computed<string>(() => Object.values(props.unitMap || {}).join(', ') || '--'),
    widgetHeight: computed<string>(() => {
        const widgetHeight = props.widgetOptions?.widgetHeight?.value as WidgetHeightValue;
        return widgetHeight?.type ?? WIDGET_HEIGHT.default;
    }),
});

/* Event */
const handleSelectEtcMenu = (selected: MenuItem) => {
    if (selected.name === 'edit') {
        emit('click-edit');
    } else if (selected.name === 'clone') {
        emit('click-clone');
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
const handleClickFullData = () => {
    if (!props.fullDataLinkList?.length) return;
    window.open(router.resolve(props.fullDataLinkList[0].location).href, '_blank');
};

watch(() => state.popperVisible, (_popperVisible) => {
    if (_popperVisible) {
        state.etcMenuVisible = false;
    }
});
watch(() => state.etcMenuVisible, (_etcMenuVisible) => {
    if (_etcMenuVisible) {
        state.popperVisible = false;
    }
});
</script>

<template>
    <div class="widget-frame"
         :class="{
             full: state.isFull,
             [props.size]: props.size,
             [`widget-height-${state.widgetHeight}`]: true,
         }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div v-if="props.title !== undefined"
             class="widget-header"
        >
            <h3 class="title">
                <span>{{ props.title }}</span>
                <p-tooltip v-if="props.description?.length"
                           :contents="props.description"
                           position="bottom"
                >
                    <p-i name="ic_info-circle"
                         width="0.75rem"
                         height="0.75rem"
                         class="description-icon"
                    />
                </p-tooltip>
            </h3>
            <div class="title-bottom-text-wrapper">
                <span v-if="props.annotation"
                      class="annotation-text"
                >
                    {{ props.annotation }}
                </span>
            </div>
        </div>
        <div v-if="props.mode !== 'overlay'"
             class="action-button-wrapper"
             :class="{ 'selected': state.etcMenuVisible || state.popperVisible }"
        >
            <p-tooltip :contents="$t('COMMON.WIDGETS.EXPAND')"
                       position="top"
            >
                <p-icon-button style-type="tertiary"
                               size="sm"
                               name="ic_arrows-expand-all"
                               shape="square"
                               @click="emit('click-expand')"
                />
            </p-tooltip>
            <p-tooltip v-if="props.fullDataLinkList?.length && !props.errorMessage && props.widgetState === 'ACTIVE'"
                       :contents="$t('COMMON.WIDGETS.VIEW_FULL_DATA')"
                       position="top"
            >
                <p-popover v-if="props.fullDataLinkList.length > 1"
                           position="bottom-end"
                           :is-visible.sync="state.popperVisible"
                           trigger="click"
                >
                    <p-icon-button style-type="tertiary"
                                   size="sm"
                                   name="ic_db-where"
                                   shape="square"
                    />
                    <template #content>
                        <div class="metadata-content">
                            <div class="metadata-item-row">
                                <span class="metadata-title">{{ $t('COMMON.WIDGETS.VIEW_FULL_DATA') }}</span>
                                <template v-if="props.fullDataLinkList?.length">
                                    <div class="full-data-link-wrapper">
                                        <p-link v-for="(fullDataLink, idx) in props.fullDataLinkList"
                                                :key="`${idx}-${fullDataLink?.name}`"
                                                new-tab
                                                highlight
                                                action-icon="internal-link"
                                                :to="fullDataLink?.location"
                                        >
                                            {{ fullDataLink?.name }}
                                        </p-link>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </p-popover>
                <p-icon-button v-else
                               style-type="tertiary"
                               size="sm"
                               name="ic_db-where"
                               shape="square"
                               @click="handleClickFullData"
                />
            </p-tooltip>
            <p-select-dropdown v-if="!props.disableManageButtons"
                               style-type="tertiary-icon-button"
                               button-icon="ic_ellipsis-horizontal"
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
                     :show-button="props.mode === 'view' && !props.disableManageButtons"
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
        <span class="period-text">
            {{ props.periodText }}
        </span>
        <div v-if="state.showWidthToggleButton"
             class="widget-toggle-button-wrapper"
        >
            <p-button style-type="tertiary"
                      :icon-left="state.isFull ? 'ic_arrows-collapse-all' : 'ic_arrows-expand-all'"
                      class="width-toggle-button"
                      @click="handleToggleWidth"
            >
                {{ state.isFull ? $t('COMMON.WIDGETS.DEFAULT_WIDTH') : $t('COMMON.WIDGETS.FULL_WIDTH') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-frame {
    position: relative;
    height: 22.5rem;

    @apply rounded-lg bg-white border border-gray-200;
    display: inline-flex;
    flex-direction: column;
    padding: 1rem;
    &.sm {
        height: 11rem;
    }
    &.full {
        height: 35rem;
    }
    &.widget-height-full {
        height: 22.5rem;
    }
    &:hover {
        .action-button-wrapper {
            display: flex;
        }
        .period-text {
            display: block;
        }
    }

    .widget-header {
        position: relative;
        align-items: center;
        padding-bottom: 0.5rem;
        .title {
            @apply truncate text-label-md;
            max-width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            -webkit-box-orient: vertical;
            font-weight: 500;
            .description-icon {
                margin-left: 0.25rem;
            }
        }
        .title-bottom-text-wrapper {
            display: flex;
            justify-content: space-between;

            @apply text-label-sm text-gray-500;
        }
    }
    .period-text {
        @apply text-label-sm text-gray-500;
        position: absolute;
        right: 0.5rem;
        bottom: 0.25rem;
        display: none;
    }
    .metadata-content {
        @apply text-label-md;
        display: flex;
        line-height: normal;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 20rem;
        min-width: 20rem;
        max-width: 25rem;
        overflow-y: auto;
        z-index: 100;
        .metadata-item-row {
            display: flex;
            justify-content: flex-start;
            .full-data-link-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
                padding-left: 2rem;
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
        gap: 0.25rem;
        z-index: 10;
        padding: 0.25rem;
        &.selected {
            display: flex;
        }
    }
}
</style>
