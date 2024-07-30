<script setup lang="ts">
import {
    reactive, computed, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PIconButton, PPopover, PLink, PEmpty, PTooltip, PSkeleton, PSelectDropdown, PButton,
} from '@cloudforet/mirinae';
import { POPOVER_TRIGGER } from '@cloudforet/mirinae/src/data-display/popover/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetSize } from '@/schema/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import { WIDGET_WIDTH_STR_MAP } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFrameEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


const props = defineProps<WidgetFrameProps>();
const emit = defineEmits<WidgetFrameEmit>();
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
         :class="{ full: state.isFull, [props.size]: props.size }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div v-if="props.title !== undefined"
             class="widget-header"
        >
            <h3 class="title">
                {{ props.title }}
            </h3>
            <p v-if="props.showPeriodText"
               class="date-text"
            >
                {{ props.periodText }}
            </p>
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
                           :trigger="POPOVER_TRIGGER.CLICK"
                >
                    <p-icon-button style-type="tertiary"
                                   size="sm"
                                   name="ic_db-where"
                                   shape="square"
                    />
                    <template #content>
                        <div class="metadata-content">
                            <div class="metadata-item-row">
                                <span class="metadata-title">{{ $t('DASHBOARDS.WIDGET.FULL_DATA_LINK') }}</span>
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
            display: flex;
        }
    }

    .widget-header {
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
        }
        .date-text {
            @apply text-label-sm text-gray-500;
        }
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
        z-index: 1000;
        padding: 0.25rem;
        &.selected {
            display: flex;
        }
        .etc-button {
            @apply bg-white;
        }
    }
}
</style>
