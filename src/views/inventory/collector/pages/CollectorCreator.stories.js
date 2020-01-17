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

        const listVersionsInfo = () => {
            state.versions = casual.pluginVersions;
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);

        /**
         * @name listCredentials
         * @param query {Object}
         */
        const listCredentials = (query) => {
            state.loading = true;
            state.credentials = [];
            setTimeout(() => {
                state.totalCount = casual.integer(10, 100);
                state.credentials = arrayOf(query.page.limit, casual._credential);
                state.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        /**
         * @name listCredentialsGroup
         * @param query {Object}
         */
        const listCredentialsGroup = (query) => {
            state.loading = true;
            state.credentials = [];
            setTimeout(() => {
                state.totalCount = casual.integer(10, 100);
                state.credentials = arrayOf(query.page.limit, casual._credential);
                state.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);


        const getPlugin = () => {
            setTimeout(() => {
                state.totalCount = casual.integer(10, 100);
                state.plugin = casual.pluginInfo;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);

        return {
            ...toRefs(state),
        };
    },
});
