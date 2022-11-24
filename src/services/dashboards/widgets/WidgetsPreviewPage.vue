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
        <component :is="widgetComponent"
                   v-if="mounted"
                   ref="widgetRef"
                   :widget-config-id="widgetId"
                   :widget-key="widgetId"
                   :currency-rates="currencyRates"
        />
    </div>
</template>

<script lang="ts">
import { useInterval, useWindowFocus } from '@vueuse/core';
import {
    defineComponent, reactive, toRefs, computed, onUnmounted, watch,
} from 'vue';

import { PButton, PIconButton } from '@spaceone/design-system';

import { store } from '@/store';

import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/helper';

interface Props {
    widgetId: string
}

export default defineComponent<Props>({
    name: 'WidgetsPreviewPage',
    components: { PIconButton, PButton },
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
