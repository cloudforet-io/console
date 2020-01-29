import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import CollectorCreatorTemplate, { setDataState } from './CollectorCreator.template.vue';
import { crdState } from '@/views/inventory/collector/modules/ChooseCredentials.vue';
import { confState } from '@/views/inventory/collector/modules/ConfigureCollector.vue';
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

        const listCredentials = () => {
            crdState.loading = true;
            crdState.credentials = [];
            setTimeout(() => {
                crdState.selectIndex = [];
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        const listCredentialsGroup = () => {
            crdState.loading = true;
            crdState.credentials = [];
            setTimeout(() => {
                crdState.selectIndex = [];
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);


        const getPlugin = () => {
            setTimeout(() => {
                confState.plugin = casual.pluginInfo;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);


        const listVersionsInfo = () => {
            confState.versions = casual.pluginVersions;
            if (!confState.selectedVersion) confState.selectedVersion = confState.versions[0];
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
