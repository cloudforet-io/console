import { withKnobs, object } from '@storybook/addon-knobs/vue';
import { toRefs, reactive, ref } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import ConfigureCollector from './ConfigureCollector';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    title: 'view/inventory/collector/modules/ConfigureCollector',
    component: ConfigureCollector,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { ConfigureCollector },
    template: `<div>
                <ConfigureCollector style="width: 80vw;
                                                          border: 1px solid plum;
                                                          background-color: white;"
                                   :plugin="plugin"
                                   :versions="versions"
                
                />
                <h4>options</h4>
                <pre>{{JSON.stringify(plugin.template.options, null, 2)}}</pre>
</div>`,
    setup(...args) {
        const versions = ref(null);
        const listVersionsInfo = () => {
            versions.value = casual.pluginVersions;
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);
        return {
            plugin: ref(casual.pluginInfo),
            versions,
            listVersionsInfo: action('listVersionsInfo', listVersionsInfo),
        };
    },
});
