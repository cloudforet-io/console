<template>
    <div class="widget-frame"
         :class="{ full: isFull }"
         :style="{ width: isFull ? '100%' : width }"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ title }}
            </h3> <slot name="header-right" />
        </div>
        <div class="body">
            <slot />
        </div>
        <div class="widget-footer">
            <div class="footer-left">
                <p-datetime-picker style-type="text"
                                   select-mode="range"
                                   :selected-dates.sync="proxySelectedDates"
                />
                <p-divider :vertical="true" />
                <currency-select-dropdown :print-mode="printMode"
                                          @update="handleUpdateCurrency"
                />
            </div>
            <div class="footer-right">
                <slot name="footer-right">
                    <router-link v-if="widgetLink && !printMode"
                                 :to="widgetLink"
                                 class="anchor-button"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FULL_DATA') }}
                        <p-i name="ic_arrow_right"
                             width="1rem"
                             height="1rem"
                             color="inherit transparent"
                        />
                    </router-link>
                </slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    reactive, toRefs, defineComponent, computed,
} from 'vue';

import { PDatetimePicker, PDivider, PI } from '@spaceone/design-system';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import { useProxyValue } from '@/common/composables/proxy-state';

import { WIDGET_SIZE } from '../config';
import type { WidgetSize } from '../type';
import CurrencySelectDropdown from './CurrencySelectDropdown.vue';

interface Props {
    title: string;
    size: WidgetSize;
    width: string;
    widgetLink: string;
    noData: boolean;
    printMode: boolean;
    selectedDates: string[];
    currency: Currency;
}

export default defineComponent<Props>({
    name: 'WidgetFrame',
    components: {
        CurrencySelectDropdown,
        PDatetimePicker,
        PDivider,
        PI,
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
            type: [Object, String],
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
            default: CURRENCY.USD,
        },
    },
    setup(props, { emit }:SetupContext) {
        const state = reactive({
            proxySelectedDates: useProxyValue('selectedDates', props, emit),
            proxyCurrency: useProxyValue('currency', props, emit),
            isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
        });

        const handleUpdateCurrency = (currency: Currency) => {
            state.proxyCurrency = currency;
        };
        return {
            ...toRefs(state),
            handleUpdateCurrency,
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
        @apply border-t rounded-b-lg flex justify-between items-center;
        padding: 0 1rem;
        flex: 0 0;
        .footer-left {
            @apply flex items-center gap-2;
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
