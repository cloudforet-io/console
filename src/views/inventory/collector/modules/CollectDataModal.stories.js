import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import casual from '@/views/inventory/collector/models/collector-model';
import CollectDataModal, { collectDataState } from './CollectDataModal.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';

export default {
    title: 'view/inventory/collector/modules/CollectDataModal',
    component: CollectDataModal,
    parameters: {
        info: {
            summary: '',
            components: { CollectDataModal },
        },
    },
};

export const defaultCase = () => ({
    components: { CollectDataModal },
    template: `<div>
        <CollectDataModal v-if="visible" 
                          :visible.sync="visible" 
                          :collector="collector"></CollectDataModal>
        <button @click="openModal">open modal</button>
    </div>`,
    setup(props, context) {
        const state = reactive({
            visible: false,
            collector: casual.collector,
        });

        const openModal = () => {
            state.visible = true;
            state.collector = casual.collector;
        };

        const listCredentialsByGroup = () => {
            collectDataState.crds = [];
            collectDataState.crdMenuIdx = 0;
            setTimeout(() => {
                collectDataState.crds = arrayOf(casual.integer(3, 7), casual._credential);
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsByGroup', listCredentialsByGroup);

        const getCredential = () => {
            setTimeout(() => {
                collectDataState.crd = casual._credential;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'getCredential', getCredential);

        return {
            ...toRefs(state),
            openModal,
        };
    },
});
