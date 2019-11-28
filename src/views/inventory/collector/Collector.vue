
<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from '@/views/inventory/collector/Collector.template';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'Server',
    extends: CollectorTemplate,
    setup(props, context) {
        const state = reactive({
            ...collectorSetup(props, context),
        });

        // request list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });

        const getCollectorList = async () => {
            state.loading = true;
            state.items = [];
            try {
                const res = await context.parent.$http.post('/inventory/collector/list', {
                    query: requestState.query,
                });
                console.log('getCollectorList', res.data);
                state.items = res.data.results;
                state.allPage = Math.ceil(res.data.total_count / state.pageSize) || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.loading = false;
            }
        };

        mountBusEvent(collectorEventBus, 'getCollectorList', getCollectorList);

        return {
            ...toRefs(state),
        };
    },
};
</script>
