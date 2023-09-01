<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import {
    PLink, PButton, PDivider, PIconButton, PI, PTooltip,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { getUUID } from '@/lib/component-util/getUUID';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import { red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';
import DashboardWidgetEditModal from '@/services/dashboards/widgets/_components/DashboardWidgetEditModal.vue';
import type { WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type { WidgetTheme } from '@/services/dashboards/widgets/_configs/view-config';


export interface WidgetFrameProps {
    title: TranslateResult;
    size: WidgetSize;
    width?: number;
    widgetLink?: string;
    widgetLocation?: Location;
    widgetConfigId?: string;
    dateRange?: DateRange;
    noData?: boolean;
    printMode?: boolean;
    selectedDates?: string[];
    currency?: Currency;
    editMode?: boolean;
    errorMode?: boolean;
    disableExpandIcon?: boolean;
    disableEditIcon?: boolean;
    disableDeleteIcon?: boolean;
    disableFullSize?: boolean;
    disableViewMode?: boolean;
    isOnlyFullSize?: boolean;
    widgetKey: string;
    overflowY?: string;
    refreshOnResize?: boolean;
    theme?: WidgetTheme;
    nonInheritOptionsTooltipText?: string;
}

interface IconConfig {
    isAvailable: boolean;
    name: string;
    handleClick: () => void;
}
const { i18nDayjs } = useI18nDayjs();

const props = withDefaults(defineProps<WidgetFrameProps>(), {
    width: undefined,
    widgetLink: undefined,
    widgetLocation: undefined,
    widgetConfigId: undefined,
    dateRange: () => ({ start: undefined, end: undefined }),
    selectedDates: () => [],
    currency: undefined,
    overflowY: undefined,
    theme: undefined,
    nonInheritOptionsTooltipText: undefined,
});

const emit = defineEmits(['refresh']);

const dashboardDetailStore = useDashboardDetailInfoStore();
const widgetFormStore = useWidgetFormStore();
const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
    dateLabel: computed<TranslateResult|undefined>(() => {
        const start = props.dateRange?.start;
        const endDayjs = props.dateRange?.end ? dayjs.utc(props.dateRange.end) : undefined;
        if (endDayjs) {
            let endText;
            const isCurrentMonth = endDayjs.isSame(dayjs.utc(), 'month');
            if (isCurrentMonth) endText = dayjs.utc().format('YY-MM-DD');
            else endText = endDayjs.endOf('month').format('YY-MM-DD');
            if (start) {
                const startText = dayjs.utc(start).format('YY-MM-DD');
                return `${startText} ~ ${endText}`;
            }
            return endText;
        }
        if (start && !endDayjs) {
            const today = dayjs();
            const diff = today.diff(start, 'day', true);
            if (diff < 1) return i18n.t('DASHBOARDS.WIDGET.DATE_TODAY');
            if (diff >= 6 && diff < 7) return i18n.t('DASHBOARDS.WIDGET.DATE_PAST_7_DAYS');
            return i18nDayjs.value(start).from(today.subtract(1, 'day'));
        }
        return undefined;
    }),
    currencyLabel: computed<string|undefined>(() => (props.currency ? `${CURRENCY_SYMBOL[props.currency]}${props.currency}` : undefined)),
    isDivided: computed<boolean|undefined>(() => (state.dateLabel && !props.noData && state.currencyLabel)),
    visibleEditModal: false,
    visibleDeleteModal: false,
    editModeIconButtonList: computed<IconConfig[]>(() => [
        {
            isAvailable: !(props.disableFullSize || props.isOnlyFullSize),
            name: state.isFull ? 'ic_arrows-collapse-all' : 'ic_arrows-expand-all',
            handleClick: () => {
                dashboardDetailStore.toggleWidgetSize(props.widgetKey);
                if (props.refreshOnResize) emit('refresh');
            },
        },
        {
            isAvailable: !props.disableEditIcon,
            name: 'ic_edit',
            handleClick: handleEditButtonClick,
        },
        {
            isAvailable: !props.disableDeleteIcon,
            name: 'ic_delete',
            handleClick: () => {
                state.visibleDeleteModal = true;
            },
        },
    ]),
});

const handleEditButtonClick = () => { state.visibleEditModal = true; };
const handleDeleteModalConfirm = () => {
    dashboardDetailStore.deleteWidget(props.widgetKey);
    state.visibleDeleteModal = false;
};
const handleClickViewModeButton = () => {
    widgetFormStore.$patch({
        widgetKey: props.widgetKey,
        theme: props.theme,
    });
    dashboardDetailStore.$patch({
        widgetViewModeModalVisible: true,
    });
};
</script>

<template>
    <div class="widget-frame"
         :class="{ full: state.isFull, 'edit-mode': props.editMode }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ props.title }}
            </h3><slot name="header-right" />
        </div>
        <p-icon-button v-if="!props.editMode && !props.disableViewMode"
                       v-tooltip.bottom="$t('DASHBOARDS.FULL_SCREEN_VIEW.FULL_SCREEN_VIEW')"
                       class="view-mode-button"
                       name="ic_arrows-expand-all"
                       shape="square"
                       style-type="tertiary"
                       @click="handleClickViewModeButton"
        />
        <div class="body"
             :style="{overflowY: props.overflowY}"
        >
            <slot v-if="!props.errorMode" />
            <div v-else
                 class="error-container"
            >
                <div class="error-title">
                    <span class="error-icon-wrapper">
                        <p-i name="ic_error-filled"
                             height="1.5rem"
                             width="1.5rem"
                             :color="red[400]"
                        />
                    </span>
                    <span>{{ $t('DASHBOARDS.WIDGET.ERROR_TITLE') }}</span>
                </div>
                <span class="error-message">
                    {{ $t("DASHBOARDS.WIDGET.ERROR_MSG") }}
                </span>
                <p-button class="edit-button"
                          style-type="tertiary"
                          @click="handleEditButtonClick"
                >
                    {{ $t('DASHBOARDS.WIDGET.EDIT_WIDGET') }}
                </p-button>
            </div>
        </div>
        <div class="widget-footer">
            <div class="widget-footer-wrapper">
                <div class="footer-left">
                    <label v-if="state.dateLabel"
                           class="widget-footer-label"
                    >{{ state.dateLabel }}</label>
                    <p-divider v-if="state.isDivided"
                               :vertical="true"
                    />
                    <label class="widget-footer-label">{{ state.currencyLabel }}</label>
                    <p-divider v-if="props.nonInheritOptionsTooltipText"
                               :vertical="true"
                    />
                    <p-tooltip v-if="props.nonInheritOptionsTooltipText"
                               class="widget-non-inherit-tooltip"
                               :contents="props.nonInheritOptionsTooltipText"
                    >
                        <p-i name="ic_warning-filled"
                             width="1rem"
                             height="1rem"
                             color="inherit"
                        />
                    </p-tooltip>
                </div>
                <div class="footer-right">
                    <slot name="footer-right">
                        <p-link v-if="(props.widgetLink || props.widgetLocation) && !props.printMode && !props.editMode"
                                :href="props.widgetLink"
                                :to="props.widgetLocation"
                                :action-icon="ACTION_ICON.INTERNAL_LINK"
                                class="link-button"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FULL_DATA') }}
                        </p-link>
                    </slot>
                </div>
            </div>
        </div>
        <div v-if="props.editMode"
             class="edit-mode-cover"
        >
            <div class="button-group">
                <template v-for="icon in state.editModeIconButtonList">
                    <p-icon-button v-if="icon.isAvailable"
                                   :key="`${icon.name}-${getUUID()}`"
                                   :name="icon.name"
                                   shape="square"
                                   style-type="tertiary"
                                   @click="icon.handleClick"
                    />
                </template>
            </div>
        </div>
        <delete-modal :visible.sync="state.visibleDeleteModal"
                      :header-title="$t('DASHBOARDS.WIDGET.DELETE_TITLE')"
                      :contents="$t('DASHBOARDS.WIDGET.DELETE_CONTENTS')"
                      @confirm="handleDeleteModalConfirm"
        />
        <dashboard-widget-edit-modal :widget-config-id="props.widgetConfigId"
                                     :visible.sync="state.visibleEditModal"
                                     :widget-key="props.widgetKey"
                                     @refresh="emit('refresh')"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-frame {
    position: relative;
    height: 29rem;

    @apply border rounded-lg bg-white;
    border-color: theme('colors.gray.200');
    display: inline-flex;
    flex-direction: column;

    .widget-header {
        @apply flex items-center;
        .title {
            @apply truncate;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            -webkit-box-orient: vertical;
            font-size: 1rem;
            font-weight: 700;
            color: theme('colors.gray.900');
            line-height: 1.25;
            margin: 0.25rem 0;
            padding-right: 1rem;
        }
        padding: 0.75rem 2.5rem 1rem 1.5rem;
        border-color: inherit;
        flex: 0 0;
    }
    .view-mode-button {
        position: absolute;
        display: none;
        right: 0.25rem;
        top: 0.25rem;
    }
    &:hover {
        .view-mode-button {
            display: flex;
        }
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
    .widget-footer {
        @apply border-t rounded-b-lg bg-gray-100 border-gray-200;
        padding: 0.3125rem 1rem;
        height: 1.75rem;
        > .widget-footer-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 0 0;
            .footer-left {
                @apply flex items-center gap-2;
                .widget-footer-label {
                    font-size: 0.875rem;
                    color: theme('colors.gray.700');
                    line-height: 1.25;
                    margin: 0;
                }
                .p-divider {
                    &.vertical {
                        height: 1rem;
                    }
                }
                .widget-non-inherit-tooltip {
                    @apply text-gray-700;
                }
            }
            .footer-right {
                .link-button {
                    @apply flex items-center flex-shrink-0 text-blue-700 font-normal cursor-pointer;
                    font-size: 0.75rem;
                    line-height: 150%;
                    margin-top: 0.1rem;
                    &:hover {
                        @apply text-secondary underline;
                    }
                }
            }
        }
    }
    &.full {
        height: auto;
    }
    &.edit-mode {
        position: relative;
    }
    .edit-mode-cover {
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 0.75rem;
        .button-group {
            @apply flex gap-2 flex-wrap justify-end;
        }
    }
}
</style>
