import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import CollectorUpdateModal from './CollectorUpdateModal.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    title: 'views/inventory/collector/modules/CollectorUpdateModal',
    component: CollectorUpdateModal,
    parameters: {
        info: {
            summary: '',
            components: { CollectorUpdateModal },
        },
    },
};

export const defaultCase = () => ({
    components: { CollectorUpdateModal },
    template: `
        <div>
            <CollectorUpdateModal v-if="updateModalState.visible"
                                  :visible.sync="updateModalState.visible"
                                  :loading="updateModalState.loading"
                                  :plugin="updateModalState.plugin"
                                  :versions="updateModalState.versions"
                                  :collector="updateModalState.collector"
            ></CollectorUpdateModal>
            <button @click="updateModalState.visible = true">open modal</button>
        </div>
    `,
    setup(props, context) {
        const updateModalState = reactive({
            visible: false,
            loading: false,
            versions: [],
            plugin: {},
            collector: null,
        });


        const getPlugin = async () => {
            updateModalState.loading = true;
            setTimeout(() => {
                updateModalState.plugin = casual.pluginInfo;
                updateModalState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);

        const listVersionsInfo = () => {
            updateModalState.loading = true;
            setTimeout(() => {
                updateModalState.versions = casual.pluginVersions;
                updateModalState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);

        const updateCollector = action('collectorUpdate');
        mountBusEvent(CollectorEventBus, 'updateCollector', updateCollector);

        return {
            updateModalState,
        };
    },
});
