import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import casual from '@/views/inventory/collector/models/collector-model';
import CollectorPluginsTemplate, { setup } from '@/views/inventory/collector/pages/CollectorPlugins.template';
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

        /**
         *
         * @param query
         */
        const listPlugins = (query) => {
            state.plugins = [];
            setTimeout(() => {
                state.totalCount = casual.integer(10, 100);
                state.plugins = arrayOf(state.totalCount, casual._pluginInfo);
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listPlugins', listPlugins);

        return {
            ...toRefs(state),
        };
    },
});
