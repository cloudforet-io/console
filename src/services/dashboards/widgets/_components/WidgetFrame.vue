<template>
    <div class="widget-frame"
         :class="{ full: isFull }"
         :style="{ width: isFull ? '100%' : width }"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ title }}
            </h3><slot name="header-right" />
        </div>
        <div class="body">
            <slot />
        </div>
        <div class="widget-footer">
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
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    reactive, toRefs, defineComponent, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Route } from 'vue-router';

import { PAnchor, PDivider } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { WidgetOptions, WidgetSize } from '@/services/dashboards/widgets/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/config';

interface Props {
    title: string;
    size: WidgetSize;
    width: string;
    widgetLink?: string;
    widgetRoute?: Route;
    dateRange?: WidgetOptions['date_range'];
    noData: boolean;
    printMode: boolean;
    selectedDates: string[];
    currency?: Currency;
}

export default defineComponent<Props>({
    name: 'WidgetFrame',
    components: {
        PAnchor,
        PDivider,
    },
    props: {
        title: {
            type: String,
            default: 'Title',
        },
        size: {
            type: String as PropType<WidgetSize>,
            default: WIDGET_SIZE.md,
        },
        width: {
            type: String,
            default: '30rem', // default width of md size
        },
        widgetLink: {
            type: String,
            default: undefined,
        },
        widgetRoute: {
            type: Object as PropType<Route>,
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
    },
    setup(props) {
        const { i18nDayjs } = useI18nDayjs();
        const setBasicDateFormat = (date) => (date ? dayjs(date).format('YYYY-MM-DD') : undefined);
        const state = reactive({
            isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
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
        });

        return {
            ...toRefs(state),
            WIDGET_SIZE,
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
        overflow-y: scroll;
    }
    .widget-footer {
        @apply border-t rounded-b-lg flex justify-between items-center bg-gray-100;
        padding: 0.3125rem 1rem;
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
    &.full {
        height: 100%;
        min-height: 29rem;
    }
}

</style>
