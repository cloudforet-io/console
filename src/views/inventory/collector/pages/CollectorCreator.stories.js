import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorCreatorTemplate, { setDataState } from './CollectorCreator.template.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';

export default {
    title: 'view/inventory/collector/pages/CollectorCreator',
};

export const defaultCase = () => ({
    extends: CollectorCreatorTemplate,
    setup(props, context) {
        const state = setDataState();

        const listCredentials = (params) => {
            state.crdState.loading = true;
            state.crdState.items = [];
            setTimeout(() => {
                state.crdState.selectIndex = [];
                state.crdState.totalCount = casual.integer(10, 100);
                state.crdState.items = arrayOf(params.query.page.limit, casual._credential);
                state.crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);


        const getPlugin = () => {
            state.confState.plugin = null;
            setTimeout(() => {
                state.confState.plugin = casual.pluginInfo;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);


        const listVersionsInfo = () => {
            setTimeout(() => {
                state.confState.versions = casual.pluginVersions;
                if (!state.confState.selectedVersion) {
                    state.confState.selectedVersion = state.confState.versions[0];
                }
            }, 1000);
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        const createCollector = () => {
            action('create collector');
        };
        mountBusEvent(CollectorEventBus, 'createCollector', createCollector);

        return {
            ...toRefs(state),
        };
    },
});
