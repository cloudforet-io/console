
<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorTemplate, { api, collectorSetup } from '@/views/inventory/collector/pages/Collector.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import {
    defaultAutocompleteHandler,
    getEnumValues, getFetchValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export default {
    name: 'Collector',
    extends: CollectorTemplate,
    setup(props, context) {
        class ACHandler extends defaultAutocompleteHandler {
            // eslint-disable-next-line class-methods-use-this
            get keys() {
                return [
                    'collector_id', 'name', 'state', 'priority',
                    'plugin_info.options.supported_resource_type',
                ];
            }

            // eslint-disable-next-line class-methods-use-this
            get suggestKeys() {
                return ['collector_id', 'name', 'plugin_info.options.supported_resource_type'];
            }

            // eslint-disable-next-line class-methods-use-this
            get parent() {
                return context.parent;
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchUrl() {
                return '/inventory/collector/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return ['collector_id', 'name'];
            }

            // eslint-disable-next-line no-shadow
            constructor() {
                super();
                this.handlerMap.value.push(...[
                    getEnumValues('state', ['ENABLED', 'DISABLED']),
                    getEnumValues('plugin_info.options.supported_resource_type', ['SERVER', 'NETWORK', 'SUBNET', 'IP_ADDRESS']),
                ]);
            }
        }


        const state = reactive({
            ...collectorSetup(props, context, new ACHandler()),
        });

        const collectorTableQuery = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
            state.searchText,
        )));

        const getCollectorList = async () => {
            state.loading = true;
            state.selectIndex = [];
            state.items = [];
            try {
                const res = await context.parent.$http.post('/inventory/collector/list', {
                    query: collectorTableQuery.value,
                });
                state.items = res.data.results;
                state.allPage = Math.ceil(res.data.total_count / state.pageSize) || 1;
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'getCollectorList', getCollectorList);


        const getPlugin = async (params) => {
            state.updateModalState.plugin = null;
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', params);
                state.updateModalState.plugin = res.data;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);


        const listVersionsInfo = async (params) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', params);
                state.updateModalState.versions = res.data.version;
                if (!state.updateModalState.selectedVersion) {
                    state.updateModalState.selectedVersion = state.updateModalState.versions[0];
                }
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        const updateCollector = async (params) => {
            state.updateModalState.loading = true;
            try {
                const res = await context.parent.$http.post('/inventory/collector/update', params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Collector',
                    duration: 2000,
                    speed: 1000,
                });
                await getCollectorList();
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
            } finally {
                state.updateModalState.loading = false;
                state.updateModalState.visible = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'updateCollector', updateCollector);


        const enableCollectors = async () => {
            try {
                await context.parent.$http.post('/inventory/collector/enable', {
                    collectors: state.multiItems.map(item => item.collector_id),
                });
                await getCollectorList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Enable Collector',
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
            } finally {
                state.checkModalState.visible = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'enableCollectors', enableCollectors);


        const disableCollectors = async () => {
            try {
                await context.parent.$http.post('/inventory/collector/disable', {
                    collectors: state.multiItems.map(item => item.collector_id),
                });
                await getCollectorList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Disable Collector',
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
            } finally {
                state.checkModalState.visible = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'disableCollectors', disableCollectors);


        const deleteCollectors = async () => {
            try {
                await context.parent.$http.post('/inventory/collector/delete', {
                    collectors: state.multiItems.map(item => item.collector_id),
                });
                await getCollectorList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Delete Collector',
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
            } finally {
                state.checkModalState.visible = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'deleteCollectors', deleteCollectors);


        const confirmTags = async (params) => {
            try {
                await context.parent.$http.post('/inventory/collector/update', params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Tags',
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
        mountBusEvent(CollectorEventBus, 'confirmTags', confirmTags);


        const listCredentialsByCollector = async (query) => {
            const crdId = _.get(state.selectedItem, 'plugin_info.credential_id');
            const crdgId = _.get(state.selectedItem, 'plugin_info.credential_group_id');

            const params = {
                query,
                // eslint-disable-next-line camelcase
                include_credential_group: true,
            };

            state.crdState.loading = true;
            state.crdState.items = [];
            try {
                // eslint-disable-next-line camelcase
                if (crdId) params.credential_id = crdId;
                // eslint-disable-next-line camelcase
                else if (crdgId) params.credential_group_id = crdgId;
                else throw new Error('No credential id or credential group id');

                const res = await context.parent.$http.post('/secret/credential/list', params);
                state.crdState.selectIndex = [];
                state.crdState.totalCount = res.data.total_count;
                state.crdState.items = res.data.results;
            } catch (e) {
                console.error(e);
            } finally {
                state.crdState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsByCollector', listCredentialsByCollector);


        const listCredentials = async (params) => {
            state.collectDataState.loading = true;
            try {
                const res = await context.parent.$http.post('/secret/credential/list', params);
                state.collectDataState.credentials = res.data.results;
                state.collectDataState.loading = false;
            } catch (e) {
                console.error(e);
                state.collectDataState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const collectData = async (params) => {
            state.collectDataState.loading = true;

            try {
                await context.parent.$http.post('/inventory/collector/collect', params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Collect Data',
                    duration: 2000,
                    speed: 1000,
                });
                state.collectDataState.loading = false;
                state.collectDataState.modalVisible = false;
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
                state.collectDataState.loading = false;
                state.collectDataState.modalVisible = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'collectData', collectData);


        const getCollectorSchedule = async (params) => {
            state.scheduleState.loading = true;
            try {
                const res = await context.parent.$http.post('/inventory/collector/schedule/list', params);
                state.scheduleState.scheduleId = _.get(res, 'data.schedule_id', null);
                state.scheduleState.hours = _.get(res, 'data.schedule.hours', []);
            } catch (e) {
                console.error(e);
                state.scheduleState.hours = [1, 2];
                state.scheduleState.scheduleId = null;
            } finally {
                state.scheduleState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'getCollectorSchedule', getCollectorSchedule);

        const updateCollectorSchedule = async (params) => {
            state.scheduleState.loading = true;
            const url = params.schedule_id ? '/inventory/collector/schedule/update' : '/inventory/collector/schedule/add';
            try {
                const res = await context.parent.$http.post(url, params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Schedule',
                    duration: 2000,
                    speed: 1000,
                });
                state.scheduleState.hours = _.get(res, 'data.schedule.hours', []);
                state.scheduleState.isEditMode = false;
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
            } finally {
                state.scheduleState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'updateCollectorSchedule', updateCollectorSchedule);

        return {
            ...toRefs(state),
        };
    },
};
</script>
