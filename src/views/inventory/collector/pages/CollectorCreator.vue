<script>
import { toRefs } from '@vue/composition-api';
import CollectorCreatorTemplate, { setDataState } from '@/views/inventory/collector/pages/CollectorCreator.template.vue';
import { crdState } from '@/views/inventory/collector/modules/ChooseCredentials.vue';
import { confState } from '@/views/inventory/collector/modules/ConfigureCollector.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'CollectorPlugins',
    extends: CollectorCreatorTemplate,
    setup(props, context) {
        const state = setDataState();


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


        const listCredentialsGroup = async () => {
            crdState.loading = true;
            crdState.items = [];
            try {
                const res = await context.parent.$http.post('/secret/credential-group/list', {
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
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);


        const getPlugin = async () => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', {
                    // eslint-disable-next-line camelcase
                    plugin_id: confState.pluginId,
                });
                confState.plugin = res.data;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);

        const listVersionsInfo = async () => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', {
                    // eslint-disable-next-line camelcase
                    plugin_id: confState.pluginId,
                });
                confState.versions = res.data.version;
                if (!confState.selectedVersion) confState.selectedVersion = confState.versions[0];
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        const createCollector = async () => {
            const crdKey = crdState.crdType === 'Credentials' ? 'credential_id' : 'credential_group_id';
            try {
                const res = await context.parent.$http.post('/inventory/collector/create', {
                    name: confState.plugin.name,
                    priority: confState.priority,
                    tags: state.tags,
                    plugin_info: {
                        plugin_id: confState.plugin.plugin_id,
                        version: confState.selectedVersion,
                        options: confState.optionsValue,
                        [crdKey]: crdState.items[crdState.selectIndex[0]][crdKey],
                    },
                });
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
