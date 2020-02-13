import { withKnobs, text } from '@storybook/addon-knobs/vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorTemplate, { collectorSetup } from './Collector.template.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';

export default {
    title: 'views/inventory/collector/pages/Collector',
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
            state.crdState.loading = true;
            state.crdState.items = [];
            setTimeout(() => {
                state.crdState.selectIndex = [];
                state.crdState.totalCount = casual.integer(10, 100);
                state.crdState.items = arrayOf(state.crdState.query.page.limit, casual._credential);
                state.crdState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const selectedItems = computed(() => state.crdState.selectIndex.map(idx => state.crdState.items[idx]));
        const verifyCredentials = () => {
            state.crdState.loading = true;
            state.crdState.items = [];
            setTimeout(() => {
                state.crdState.selectIndex = [];
                state.crdState.totalCount = casual.integer(10, 100);
                state.crdState.items = arrayOf(state.crdState.query.page.limit, casual._credential);
                state.crdState.loading = false;
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'verifyCredentials', verifyCredentials);

        return {
            ...toRefs(state),
        };
    },
});
