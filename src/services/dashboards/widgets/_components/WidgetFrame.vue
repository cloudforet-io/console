<template>
    <div class="widget-frame"
         :class="{ full: isFull, 'edit-mode': editMode }"
         :style="{ width: width ? `${width}px` : '100%' }"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ title }}
            </h3><slot name="header-right" />
        </div>
        <div class="body"
             :style="{overflowY}"
        >
            <slot v-if="!errorMode" />
            <div v-else
                 class="error-container"
            >
                <p-i name="sad-face"
                     :color="gray[500]"
                     width="3.5rem"
                     height="3.5rem"
                />
                <div class="error-title">
                    {{ $t('Unable to load') }}
                </div>
                <!--song-lang-->
                <span class="error-message">
                    {{ $t("There seems to be an incompatibility between dashboard's variables and widget options. You need to edit the filters to make it work.") }}
                </span>
                <p-button class="edit-button"
                          style-type="tertiary"
                          @click="handleEditButtonClick"
                >
                    {{ $t('Edit Widget') }}
                </p-button>
            </div>
        </div>
        <div class="widget-footer">
            <div class="widget-footer-wrapper">
                <div class="footer-left">
                    <label v-if="dateLabel"
                           class="widget-footer-label"
                    >{{ dateLabel }}</label>
                    <p-divider v-if="isDivided"
                               :vertical="true"
                    />
                    <label class="widget-footer-label">{{ currencyLabel }}</label>
                </div>
                <div class="footer-right">
                    <slot name="footer-right">
                        <p-anchor v-if="(widgetLink || widgetRoute) && !printMode"
                                  :href="widgetLink"
                                  :to="widgetRoute"
                                  class="anchor-button"
                                  icon-name="ic_arrow_right"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FULL_DATA') }}
                        </p-anchor>
                    </slot>
                </div>
            </div>
        </div>
        <div v-if="editMode"
             class="edit-mode-cover"
        >
            <div class="button-group">
                <template v-for="icon in editModeIconButtonList">
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
        <delete-modal :visible.sync="visibleDeleteModal" />
        <p-button-modal :visible.sync="visibleEditModal" />
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    reactive, toRefs, defineComponent, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Route } from 'vue-router';

import {
    PAnchor, PButton, PButtonModal, PDivider, PI, PIconButton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';

import { getUUID } from '@/lib/component-util/getUUID';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import { gray } from '@/styles/colors';

import type { WidgetOptions, WidgetSize } from '@/services/dashboards/widgets/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';


interface Props {
    title: TranslateResult;
    size: WidgetSize;
    width?: number;
    widgetLink?: string;
    widgetRoute?: Route;
    widgetIndex: number;
    dateRange?: WidgetOptions['date_range'];
    noData: boolean;
    printMode: boolean;
    selectedDates: string[];
    currency?: Currency;
    editMode?: boolean;
    errorMode?: boolean;
    disableExpandIcon: boolean;
    disableEditIcon: boolean;
    disableDeleteIcon: boolean;
    isFull: boolean;
}

interface IconConfig {
    isAvailable: boolean;
    name: string;
    handleClick: () => void;
}

export default defineComponent<Props>({
    name: 'WidgetFrame',
    components: {
        PButton,
        PI,
        PButtonModal,
        DeleteModal,
        PIconButton,
        PAnchor,
        PDivider,
    },
    props: {
        title: {
            type: String as PropType<TranslateResult>,
            default: 'Title',
        },
        size: {
            type: String as PropType<WidgetSize>,
            default: WIDGET_SIZE.md,
        },
        // FIXME:: width should be -= 16 because of margin.
        width: {
            type: Number,
            default: undefined,
        },
        widgetLink: {
            type: String,
            default: undefined,
        },
        widgetRoute: {
            type: Object as PropType<Route>,
            default: undefined,
        },
        widgetIndex: {
            type: Number,
            default: undefined,
        },
        dateRange: {
            type: Object as PropType<WidgetOptions['date_range']>,
            default: undefined,
        },
        noData: {
            type: Boolean,
            default: false,
        },
        printMode: {
            type: Boolean,
            default: false,
        },
        selectedDates: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        currency: {
            type: String as PropType<Currency>,
            default: undefined,
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        errorMode: {
            type: Boolean,
            default: false,
        },
        disableExpandIcon: {
            type: Boolean,
            default: false,
        },
        disableEditIcon: {
            type: Boolean,
            default: false,
        },
        disableDeleteIcon: {
            type: Boolean,
            default: false,
        },
        isFull: {
            type: Boolean,
            default: false,
        },
        overflowY: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const { i18nDayjs } = useI18nDayjs();
        const setBasicDateFormat = (date) => (date ? dayjs(date).format('YYYY-MM-DD') : undefined);
        const handleEditButtonClick = () => { state.visibleEditModal = true; };
        const state = reactive({
            isFull: computed<boolean>(() => props.isFull),
            dateLabel: computed<TranslateResult|undefined>(() => {
                const start = setBasicDateFormat(props.dateRange?.start);
                const end = setBasicDateFormat(props.dateRange?.end);
                if (start && end) {
                    return `${start} ~ ${end}`;
                }
                if (start && !end) {
                    const today = dayjs();
                    const diff = today.diff(start, 'day', true);
                    if (diff < 1) return i18n.t('Today'); // song-lang
                    if (diff >= 6 && diff < 7) return i18n.t('Past 7 days'); // song-lang
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
                    isAvailable: !props.disableExpandIcon,
                    name: state.isFull ? 'ic_collapse-angle' : 'ic_expand-angle',
                    handleClick: () => {
                        emit('click-expand-icon', state.isFull ? 'collapse' : 'expand', props.widgetIndex);
                    },
                },
                {
                    isAvailable: !props.disableEditIcon,
                    name: 'ic_edit',
                    handleClick: handleEditButtonClick,
                },
                {
                    isAvailable: !props.disableDeleteIcon,
                    name: 'ic_trashcan',
                    handleClick: () => {
                        state.visibleDeleteModal = true;
                    },
                },
            ]),
        });

        return {
            ...toRefs(state),
            WIDGET_SIZE,
            getUUID,
            gray,
            handleEditButtonClick,
        };
    },
});
</script>

<style lang="postcss" scoped>
.widget-frame {
    height: 29rem;

    @apply border rounded-lg bg-white;
    border-color: theme('colors.gray.200');
    display: inline-flex;
    flex-direction: column;

    .widget-header {
        @apply flex justify-between items-center;
        .title {
            font-size: 1rem;
            font-weight: 700;
            color: theme('colors.gray.900');
            line-height: 1.25;
            margin: 0.25rem 0;
        }
        padding: 0.75rem 1.5rem 1rem 1.5rem;
        border-color: inherit;
        flex: 0 0;
    }
    .body {
        height: auto;
        flex: 1 1;
    }
    .error-container {
        @apply flex justify-center items-center flex-col h-full;
        padding: 0 1.5625rem;

        .error-title {
            @apply text-gray-500 mt-2;
            font-weight: 700;
            font-size: 0.875rem;
        }
        .error-message {
            margin-top: 3.625rem;
            line-height: 1.25;
            font-size: 0.875rem;
        }
        .edit-button {
            margin-top: 1rem;
        }
    }
    .widget-footer {
        @apply border-t rounded-b-lg bg-gray-100;
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
            }
            .footer-right {
                .anchor-button {
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
        height: 100%;
        min-height: 29rem;
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
