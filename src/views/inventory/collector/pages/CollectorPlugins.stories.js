import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import casual from '@/views/inventory/collector/models/collector-model';
import CollectorPluginsTemplate, { setup } from '@/views/inventory/collector/pages/CollectorPlugins.template';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/inventory/collector/pages/CollectorPlugins',
};

export const defaultCase = () => ({
    extends: CollectorPluginsTemplate,
    setup(props, context) {
        const state = setup(props, context);

        const listPlugins = () => {
            setTimeout(() => {
                state.plugins.value = casual.collectorPlugins;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listPlugins', listPlugins);

        return {
            ...state,
        };
    },
});
