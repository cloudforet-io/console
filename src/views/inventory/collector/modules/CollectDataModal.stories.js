import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
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
        <collect-data-modal v-if="visible"
                            :visible.sync="visible"
                            :collector="collector"
                            :loading="loading"
                            :credentials="credentials"
                            :is-credential-type="isCredentialType"
        />
        <button @click="openModal">open modal</button>
    </div>`,
    setup(props, context) {
        const state = reactive({
            visible: false,
            collector: casual.collector,
            loading: false,
            credentials: [],
            isCredentialType: true,
        });

        const openModal = () => {
            state.isCredentialType = casual.boolean;
            state.collector = casual.collector;
            state.visible = true;
        };

        const listCredentials = () => {
            state.loading = true;
            state.credentials = [];
            setTimeout(() => {
                state.credentials = arrayOf(casual.integer(1, 7), casual._credential);
                state.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        const collectData = action('collectData');
        mountBusEvent(CollectorEventBus, 'collectData', collectData);

        return {
            ...toRefs(state),
            openModal,
        };
    },
});
