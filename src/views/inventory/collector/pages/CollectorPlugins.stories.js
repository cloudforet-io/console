import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import casual from '@/views/inventory/collector/models/collector-model';
import CollectorPluginsTemplate, { setup } from '@/views/inventory/collector/pages/CollectorPlugins.template.vue';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { arrayOf } from '@/lib/casual';

export default {
    title: 'view/inventory/collector/pages/CollectorPlugins',
};

export const defaultCase = () => ({
    extends: CollectorPluginsTemplate,
    setup(props, context) {
        const state = reactive({
            ...setup(props, context),
        });

        const listRepositories = () => {
            state.repositories = [];
            setTimeout(() => {
                state.repositories = arrayOf(3, casual._repository);
                if (!state.selectedRepoId) {
                    state.selectedRepoId = state.repositories[0].repository_id;
                }
            }, 1000);
        };

        const listPlugins = () => {
            state.plugins = [];
            setTimeout(() => {
                state.totalCount = casual.integer(10, 100);
                state.plugins = arrayOf(state.query.page.limit, casual._pluginInfo);
            }, 1000);
        };

        const listPluginsInit = async () => {
            await listRepositories();
            await listPlugins();
        };

        mountBusEvent(CollectorEventBus, 'listPluginsInit', listPluginsInit);
        mountBusEvent(CollectorEventBus, 'listPlugins', listPlugins);


        const listVersions = (pluginId) => {
            state.versions = { ...state.versions, [pluginId]: casual.pluginVersions };
        };
        mountBusEvent(CollectorEventBus, 'listVersions', listVersions);


        return {
            ...toRefs(state),
        };
    },
});
