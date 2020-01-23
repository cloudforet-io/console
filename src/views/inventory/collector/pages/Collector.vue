
<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from '@/views/inventory/collector/pages/Collector.template.vue';
import { crdState } from '@/views/inventory/collector/modules/CollectorCredentials.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'Collector',
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
                state.items = res.data.results;
                state.allPage = Math.ceil(res.data.total_count / state.pageSize) || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.loading = false;
            }
        };

        mountBusEvent(CollectorEventBus, 'getCollectorList', getCollectorList);


        const listCredentials = async () => {
            crdState.loading = true;
            crdState.items = [];
            try {
                const res = await context.parent.$http.post('/secret/credential/list', {
                    query: crdState.query,
                });
                crdState.selectIndex = [];
                crdState.totalCount = res.data.total_count;
                crdState.items = res.data.results;
                crdState.loading = false;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const selectedItems = computed(() => crdState.selectIndex.map(idx => crdState.items[idx]));
        const verifyCredentials = async () => {
            crdState.loading = true;
            crdState.items = [];
            try {
                const res = await context.parent.$http.post('/secret/credential/list', {
                    query: crdState.query,
                });
                crdState.selectIndex = [];
                crdState.totalCount = res.data.total_count;
                crdState.items = res.data.results;
                crdState.loading = false;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'verifyCredentials', verifyCredentials);

        return {
            ...toRefs(state),
        };
    },
};
</script>
