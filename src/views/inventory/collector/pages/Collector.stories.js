import { withKnobs, text } from '@storybook/addon-knobs/vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from './Collector.template.vue';
import { crdState } from '@/views/inventory/collector/modules/CollectorCredentials.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';

export default {
    title: 'view/inventory/collector/pages/Collector',
    component: CollectorTemplate,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    extends: CollectorTemplate,
    setup(props, context) {
        const state = reactive({
            ...collectorSetup(props, context),
        });

        const getCollectorList = () => {
            state.loading = true;
            state.items = [];
            setTimeout(() => {
                state.selectIndex = [];
                const totalcount = casual.integer(10, 100);
                state.items = arrayOf(state.pageSize, casual._collector);
                state.allPage = Math.ceil(totalcount / state.pageSize) || 1;
                state.loading = false;
            }, 1000);
        };

        mountBusEvent(CollectorEventBus, 'getCollectorList', getCollectorList);


        const listCredentials = () => {
            crdState.loading = true;
            crdState.items = [];
            setTimeout(() => {
                crdState.selectIndex = [];
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const selectedItems = computed(() => crdState.selectIndex.map(idx => crdState.items[idx]));
        const verifyCredentials = () => {
            crdState.loading = true;
            crdState.items = [];
            setTimeout(() => {
                crdState.selectIndex = [];
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'verifyCredentials', verifyCredentials);

        return {
            ...toRefs(state),
        };
    },
});
