<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorPluginsTemplate, { setup } from '@/views/inventory/collector/pages/CollectorPlugins.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'CollectorPlugins',
    extends: CollectorPluginsTemplate,
    setup(props, context) {
        const state = reactive({
            ...setup(props, context),
        });


        return {
            ...toRefs(state),
        };
    },
};
</script>
