
<script>
import {
    ref, toRefs, computed, reactive, getCurrentInstance,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from '@/views/inventory/collector/pages/Collector.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import {
    defaultAutocompleteHandler,
    getEnumValues, getFetchValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { defaultQuery } from '@/lib/api/query';
import { fluentApi } from '@/lib/fluent-api';
import { DictPanelAPI } from '@/components/organisms/panels/dict-panel/dict';

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
                return ['collector_id', 'name'];
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

        // new ApiHandler(
        //     '/inventory/collector/update',
        //     (data, state) => ({
        //         // eslint-disable-next-line camelcase
        //         collector_id: state.selectedItem.collector_id,
        //         tags: data,
        //     }),
        //     (res, data, state) => {
        //         state.items[state.selectIndex[0]].tags = data;
        //     },
        // );

        const updateApi = fluentApi.inventory().collector().update();

        const state = reactive({
            ...collectorSetup(
                props,
                context,
                new ACHandler(),
                updateApi,
            ),
        });

        const collectorTableQuery = computed(() => (defaultQuery(
            state.thisPage, state.pageSize,
            state.sortBy, state.sortDesc,
            null, state.queryListTools.tags,
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
            state.updateModalState.loading = true;
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', params);
                state.updateModalState.plugin = res.data;
            } catch (e) {
                console.error(e);
            } finally {
                state.updateModalState.loading = false;
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


        const listSchedules = async (params) => {
            state.scheduleState.loading = true;
            state.scheduleState.items = [];
            state.scheduleState.selectIndex = [];
            state.scheduleState.totalCount = 0;
            try {
                const res = await context.parent.$http.post('/inventory/collector/schedule/list', params);
                state.scheduleState.items = res.data.results;
                state.scheduleState.totalCount = res.data.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.scheduleState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'listSchedules', listSchedules);

        const putCollectorSchedule = (url, msg) => async (params) => {
            state.scheduleState.editLoading = true;
            try {
                const res = await context.parent.$http.post(url, params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: msg,
                    duration: 2000,
                    speed: 1000,
                });
                state.scheduleState.editVisible = false;
                // eslint-disable-next-line camelcase
                await listSchedules({ collector_id: params.collector_id });
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
                state.scheduleState.editLoading = false;
            }
        };
        mountBusEvent(CollectorEventBus,
            'updateCollectorSchedule',
            putCollectorSchedule('/inventory/collector/schedule/update', 'Update Schedule'));
        mountBusEvent(CollectorEventBus,
            'addCollectorSchedule',
            putCollectorSchedule('/inventory/collector/schedule/add', 'Add Schedule'));

        const deleteCollectorSchedule = async (params) => {
            try {
                const res = await context.parent.$http.post('/inventory/collector/schedule/delete', params);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Delete Schedule',
                    duration: 2000,
                    speed: 1000,
                });
                state.scheduleState.deleteVisible = false;
                // eslint-disable-next-line camelcase
                await listSchedules({ collector_id: params.collector_id });
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
        mountBusEvent(CollectorEventBus, 'deleteCollectorSchedule', deleteCollectorSchedule);

        return {
            ...toRefs(state),
        };
    },
};
</script>
