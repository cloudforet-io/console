<template>
    <div class="widget-frame"
         :class="{
             [size]: true,
         }"
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
import { reactive, toRefs, defineComponent } from 'vue';

import { PDatetimePicker, PDivider, PI } from '@spaceone/design-system';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import { useProxyValue } from '@/common/composables/proxy-state';

import CurrencySelectDropdown from '@/services/cost-explorer/modules/CurrencySelectDropdown.vue';
import type { WidgetSize } from '@/services/dashboards/widgets/_components/type';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_components/type';

interface Props {
    title: string;
    size: WidgetSize;
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
        });

        const handleUpdateCurrency = (currency: Currency) => {
            state.proxyCurrency = currency;
        };
        return {
            ...toRefs(state),
            handleUpdateCurrency,
        };
    },
});
</script>

<style lang="postcss" scoped>
@define-mixin widget-size $widget-width {
    & {
        height: 29rem;
        width: $widget-width;
    }
}

.widget-frame {
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
        flex-grow: 1;
        flex-shrink: 1;
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
    &.sm {
        @mixin widget-size 24rem;
    }
    &.md {
        @mixin widget-size 34.625rem;
    }
    &.lg {
        @mixin widget-size 44rem;
    }
    &.xl {
        @mixin widget-size 54rem;
    }
}
</style>
