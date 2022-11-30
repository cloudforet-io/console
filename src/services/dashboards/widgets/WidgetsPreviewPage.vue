<template>
    <div>
        <div class="my-4">
            <p-button class="mx-4"
                      @click="handleMount"
            >
                {{ mounted ? 'Unmount Widget' : 'Mount Widget' }}
            </p-button>
            <template v-if="mounted">
                <div class="inline-block w-8 text-center">
                    {{ autoRefresh ? 10 - counter : '' }}
                </div>
                <p-icon-button class="mx-2 inline-block"
                               name="ic_refresh"
                               @click="refresh"
                />
                <p-button class="mx-2"
                          style-type="substitutive"
                          @click="handleAutoRefresh"
                >
                    {{ autoRefresh ? 'Stop Auto Refresh' : 'Start Auto Refresh' }}
                </p-button>
            </template>
        </div>
        <br>
        <div v-if="mounted"
             class="flex gap-4"
        >
            <component :is="widgetComponent"
                       ref="widgetRef"
                       :widget-config-id="widgetId"
                       :widget-key="widgetId"
                       :currency-rates="currencyRates"
                       :theme="theme"
                       :dashboard-options="{
                           currency,
                           dateRange
                       }"
                       :inherit-options="{
                           currency: { enabled: true },
                           date_range: { enabled: true },
                       }"
            />
            <div>
                <p-field-group label="Currency"
                               required
                               inline
                >
                    <currency-select-dropdown @update="currency = $event" />
                </p-field-group>
                <p-field-group label="Date Range"
                               required
                               inline
                >
                    <date-range-selector :date-range.sync="dateRange" />
                </p-field-group>
                <p-field-group label="Theme"
                               required
                               inline
                >
                    <p-select-dropdown v-model="theme"
                                       :items="widgetThemeItems"
                    />
                </p-field-group>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useInterval, useWindowFocus } from '@vueuse/core';
import {
    defineComponent, reactive, toRefs, computed, onUnmounted, watch,
} from 'vue';

import {
    PButton, PFieldGroup, PIconButton, PSelectDropdown,
} from '@spaceone/design-system';

import { store } from '@/store';

import { CURRENCY } from '@/store/modules/display/config';

import CurrencySelectDropdown from '@/services/cost-explorer/modules/CurrencySelectDropdown.vue';
import DateRangeSelector from '@/services/dashboards/widgets/_components/DateRangeSelector.vue';
import type { DateRange } from '@/services/dashboards/widgets/config';
import { WIDGET_THEMES } from '@/services/dashboards/widgets/view-config';
import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/widget-helper';

interface Props {
    widgetId: string
}

export default defineComponent<Props>({
    name: 'WidgetsPreviewPage',
    components: {
        PSelectDropdown,
        DateRangeSelector,
        PFieldGroup,
        CurrencySelectDropdown,
        PIconButton,
        PButton,
    },
    props: {
        widgetId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            widgetConfig: computed(() => getWidgetConfig(props.widgetId)),
            widgetComponent: computed(() => (props.widgetId ? getWidgetComponent(props.widgetId) : null)),
            widgetRef: null as any,
            currencyRates: computed(() => store.state.display.currencyRates),
            mounted: false,
            autoRefresh: true,
            currency: CURRENCY.USD,
            dateRange: {} as DateRange,
            theme: 'violet',
            widgetThemeItems: computed(() => WIDGET_THEMES.map((d) => ({
                type: 'item', name: d, label: d,
            }))),
        });

        const { counter, pause, resume } = useInterval(1000, { controls: true });
        const focused = useWindowFocus();

        const resetCounter = () => {
            if (state.autoRefresh) {
                counter.value = 0;
                resume();
            }
        };
        const handleMount = () => {
            state.mounted = !state.mounted;
            if (state.autoRefresh) {
                if (state.mounted) {
                    resetCounter();
                } else {
                    pause();
                }
            }
        };
        const refresh = () => {
            if (state.widgetRef) {
                state.widgetRef.refreshWidget();
                resetCounter();
            }
        };
        const handleAutoRefresh = () => {
            state.autoRefresh = !state.autoRefresh;
            if (state.autoRefresh) resetCounter();
        };

        watch(counter, (_counter) => {
            if (!state.autoRefresh) return;
            if (_counter === 10) refresh();
        });
        watch(focused, (_focused) => {
            if (!state.mounted || !state.autoRefresh) return;
            if (_focused) resume();
            else pause();
        });
        watch([() => state.currency, () => state.dateRange, () => state.theme], () => {
            refresh();
        });
        onUnmounted(() => {
            pause();
        });

        return {
            ...toRefs(state),
            handleMount,
            refresh,
            handleAutoRefresh,
            counter,
        };
    },
});
</script>
