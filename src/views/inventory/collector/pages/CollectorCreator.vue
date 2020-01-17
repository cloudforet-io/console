<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import CollectorCreatorTemplate, { setDataState } from '@/views/inventory/collector/pages/CollectorCreator.template.vue';
import { confState } from '@/views/inventory/collector/modules/ConfigureCollector.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    name: 'CollectorPlugins',
    extends: CollectorCreatorTemplate,
    setup(props, context) {
        const state = setDataState();

        /**
         * @name listCredentials
         * @param query {Object}
         */
        const listCredentials = (query) => {
            // state.loading = true;
            // state.credentials = [];
            // setTimeout(() => {
            //     state.totalCount = casual.integer(10, 100);
            //     state.credentials = arrayOf(query.page.limit, casual._credential);
            //     state.loading = false;
            // }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        /**
         * @name listCredentialsGroup
         * @param query {Object}
         */
        const listCredentialsGroup = (query) => {
            // state.loading = true;
            // state.credentials = [];
            // setTimeout(() => {
            //     state.totalCount = casual.integer(10, 100);
            //     state.credentials = arrayOf(query.page.limit, casual._credential);
            //     state.loading = false;
            // }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);


        const getPlugin = async (pluginId) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', {
                    // eslint-disable-next-line camelcase
                    plugin_id: pluginId,
                });
                confState.plugin = res.data;
                console.log('confState plugin', res.data);
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);

        const listVersionsInfo = async (pluginId) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', {
                    // eslint-disable-next-line camelcase
                    plugin_id: pluginId,
                });
                confState.versions = res.data.version;
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        return {
            ...toRefs(state),
        };
    },
};
</script>
