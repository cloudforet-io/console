<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorPluginsTemplate, { setup } from '@/views/inventory/collector/pages/CollectorPlugins.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'CollectorPlugins',
    extends: CollectorPluginsTemplate,
    setup(props, context) {
        const state = reactive({
            ...setup(props, context),
        });

        const listPlugins = async (query) => {
            state.plugins = [];
            try {
                const res = await context.parent.$http.post('/repository/remote-repository/list', {
                    query,
                });
                state.totalCount = res.data.total_count;
                state.plugins = res.data.results;
            } catch (e) {
                console.error(e);
            }
        };

        mountBusEvent(CollectorEventBus, 'listPlugins', listPlugins);

        return {
            ...toRefs(state),
        };
    },
};
</script>
