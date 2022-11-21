<template>
    <div>
        <component :is="widgetComponent"
                   :widget-config-id="widgetId"
                   :widget-key="widgetId"
        />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs, computed,
} from 'vue';

import { getWidgetComponent, getWidgetConfig } from '@/services/dashboards/widgets/helper';

interface Props {
    widgetId: string
}

export default defineComponent<Props>({
    name: 'WidgetsPreviewPage',
    components: {},
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
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
