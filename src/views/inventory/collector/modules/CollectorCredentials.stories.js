import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import CollectorCredentials from './CollectorCredentials.vue';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'views/inventory/collector/modules/CollectorCredentials',
    component: CollectorCredentials,
    parameters: {
        info: {
            summary: '',
            components: { CollectorCredentials },
        },
    },
};
export const defaultCase = () => ({
    components: { CollectorCredentials },
    template: `
        <collector-credentials :collector="collector"
                               :total-count="totalCount"
                               :items="items"
                               :loading="loading"
                               :select-index="selectIndex"
                               :selected-items="selectedItems"
                               :verify-modal-visible.sync="verifyModalVisible"
                               @collectData="collectData"
        />
    `,
    setup(props, context) {
        const state = reactive({
            collector: casual.collector,
            items: [],
            totalCount: 0,
            loading: true,
            query: undefined,
            selectIndex: [],
            verifyModalVisible: false,
            sortSelectIndex: computed(() => {
                const idxs = [...state.selectIndex];
                idxs.sort((a, b) => a - b);
                return idxs;
            }),
            selectedItems: computed(() => state.sortSelectIndex.map(idx => state.items[idx])),
        });

        const listCredentialsByCollector = (query) => {
            state.loading = true;
            state.items = [];
            setTimeout(() => {
                state.selectIndex = [];
                state.totalCount = casual.integer(30, 100);
                state.items = arrayOf(query.page.limit, casual._credential);
                state.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsByCollector', listCredentialsByCollector);

        return {
            ...toRefs(state),
            collectData: action('collectData'),
        };
    },
});
