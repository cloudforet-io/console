<template>
    <div>
        <p-button class="m-4"
                  @click="handleMount"
        >
            {{ mounted ? 'Unmount Widget' : 'Mount Widget' }}
        </p-button>
        <p-button class="m-4"
                  style-type="secondary"
                  @click="refresh"
        >
            Refresh Widget
        </p-button>
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
import {
    defineComponent, reactive, toRefs, computed,
} from 'vue';

import { PButton } from '@spaceone/design-system';

import { store } from '@/store';

import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/helper';

interface Props {
    widgetId: string
}

export default defineComponent<Props>({
    name: 'WidgetsPreviewPage',
    components: { PButton },
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
        });

        const handleMount = () => {
            state.mounted = !state.mounted;
        };
        const refresh = () => {
            if (state.widgetRef) state.widgetRef.refreshWidget();
        };
        return {
            ...toRefs(state),
            handleMount,
            refresh,
        };
    },
});
</script>
