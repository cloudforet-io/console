import { withKnobs, object } from '@storybook/addon-knobs/vue';
import { computed, ref, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import ConfigureCollector from './ConfigureCollector.vue';
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
        <configure-collector ref="conf"
                             showValidation
                             :plugin="confState.plugin"
                             :versions="confState.versions"
                             :selected-version.sync="confState.selectedVersion"
                             :options-value.sync="confState.optionsValue"
                             :priority.sync="confState.priority"
                             @changeValidState="changeValidState"
                             style="width: 80vw;
                                  border: 1px solid plum;
                                  background-color: white;"
        />
                <h4>options</h4>
                <pre>{{JSON.stringify(plugin, null, 2)}}</pre>
</div>`,
    setup(...args) {
        const confState = reactive({
            plugin: null,
            versions: [],
            selectedVersion: '',
            priority: 10,
            optionsValue: {},
        });

        const getPlugin = async () => {
            confState.optionsValue = {};
            setTimeout(() => {
                confState.plugin = casual.pluginInfo;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);

        const listVersionsInfo = () => {
            setTimeout(() => {
                confState.versions = casual.pluginVersions;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);

        return {
            plugin: computed({
                get: () => _.get(confState.plugin, 'template.options', null),
                set: () => {},
            }),
            confState,
            changeValidState: action('changeValidState'),
        };
    },
});
