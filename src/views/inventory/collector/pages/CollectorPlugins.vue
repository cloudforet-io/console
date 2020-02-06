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

        const listRepositories = async () => {
            state.repositories = [];
            try {
                const res = await context.parent.$http.post('/repository/repository/list');
                state.repositories = res.data.results;
                if (!state.selectedRepoId) {
                    state.selectedRepoId = state.repositories[0].repository_id;
                }
            } catch (e) {
                console.error(e);
            }
        };

        const listPlugins = async () => {
            state.loading = true;

            const params = {
                // eslint-disable-next-line camelcase
                repository_id: state.selectedRepoId,
                // eslint-disable-next-line camelcase
                service_type: 'inventory.collector',
                query: state.query,
            };

            state.plugins = [];
            try {
                const res = await context.parent.$http.post('/repository/plugin/list', params);
                state.totalCount = res.data.total_count;
                state.plugins = res.data.results;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const listPluginsInit = async () => {
            await listRepositories();
            await listPlugins();
        };

        mountBusEvent(CollectorEventBus, 'listPluginsInit', listPluginsInit);
        mountBusEvent(CollectorEventBus, 'listPlugins', listPlugins);


        const listVersions = async (pluginId) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', {
                    // eslint-disable-next-line camelcase
                    plugin_id: pluginId,
                });
                state.versions = { ...state.versions, [pluginId]: res.data.version };
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersions', listVersions);

        return {
            ...toRefs(state),
        };
    },
};
</script>
