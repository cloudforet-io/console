
<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from '@/views/inventory/collector/pages/Collector.template.vue';
import { crdState } from '@/views/inventory/collector/modules/CollectorCredentials.vue';
import { collectDataState } from '@/views/inventory/collector/modules/CollectDataModal.vue';
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


        const listCredentialsByGroup = async () => {
            collectDataState.crds = [];
            collectDataState.crdMenuIdx = 0;
            try {
                const res = await context.parent.$http.post('/secret/credential/list', {
                });
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsByGroup', listCredentialsByGroup);

        const getCredential = async () => {
            collectDataState.crd = null;
            setTimeout(() => {
                collectDataState.crd = casual._credential;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'getCredential', getCredential);


        const collectData = async () => {
            const params = {
                collector_id: state.items[state.selectIndex[0]].collector_id,
                collect_mode: collectDataState.collectorModes[collectDataState.collectModeIdx],
            };

            if (!_.isEmpty(collectDataState.filters)) params.filter = collectDataState.filters;

            if (collectDataState.crd) {
                params.credential_id = collectDataState.crd.credential_id;
            } else if (collectDataState.crdMenuIdx === 0) {
                params.credential_group_id = state.items[state.selectIndex[0]].plugin_info.credential_group_id;
            } else {
                params.credential_id = collectDataState.crds[collectDataState.crdMenuIdx - 1];
            }

            try {
                const res = await context.parent.$http.post('/inventory/collector/collect', params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Collect Data',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            }
        };
        mountBusEvent(CollectorEventBus, 'collectData', collectData);


        return {
            ...toRefs(state),
        };
    },
};
</script>
