<script>
import { toRefs } from '@vue/composition-api';
import _ from 'lodash';
import CollectorCreatorTemplate, { setDataState } from '@/views/inventory/collector/pages/CollectorCreator.template.vue';
import { crdState } from '@/views/inventory/collector/modules/ChooseCredentials.vue';
import { confState } from '@/views/inventory/collector/modules/ConfigureCollector.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'CollectorPlugins',
    extends: CollectorCreatorTemplate,
    setup(props, context) {
        const state = setDataState(context.root);


        const listCredentials = async (params) => {
            const url = state.crdState.crdType === 'Credentials'
                ? '/secret/credential/list' : '/secret/credential-group/list';

            state.crdState.loading = true;
            state.crdState.items = [];

            try {
                const res = await context.parent.$http.post(url, params);
                state.crdState.selectIndex = [];
                state.crdState.totalCount = res.data.total_count;
                state.crdState.items = res.data.results;
            } catch (e) {
                console.error(e);
            } finally {
                state.crdState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const getPlugin = async (params) => {
            state.confState.plugin = null;
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', params);
                state.confState.plugin = res.data;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);


        const listVersionsInfo = async (params) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', params);
                state.confState.versions = res.data.version || [];
                if (!state.confState.selectedVersion) {
                    state.confState.selectedVersion = state.confState.versions[0];
                }
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        const createCollector = async () => {
            const crdKey = state.crdState.crdType === 'Credentials' ? 'credential_id' : 'credential_group_id';
            const params = {
                name: state.confState.name,
                priority: state.confState.priority,
                tags: state.tags,
                // eslint-disable-next-line camelcase
                plugin_info: {
                    // eslint-disable-next-line camelcase
                    plugin_id: state.confState.plugin.plugin_id,
                    version: state.confState.selectedVersion,
                    [crdKey]: state.crdState.items[state.crdState.selectIndex[0]][crdKey],
                },
            };

            if (!_.isEmpty(state.confState.optionsValue)) {
                params.options = state.confState.optionsValue;
            }

            try {
                const res = await context.parent.$http.post('/inventory/collector/create', params);
                context.root.$router.push('/inventory/collector');
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'create collector',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                console.error(e);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            }
        };
        mountBusEvent(CollectorEventBus, 'createCollector', createCollector);

        return {
            ...toRefs(state),
        };
    },
};
</script>
