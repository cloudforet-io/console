import { withKnobs, object } from '@storybook/addon-knobs/vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import ChooseCredentials from './ChooseCredentials';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'view/inventory/collector/modules/ChooseCredentials',
    component: ChooseCredentials,
    decorators: [withKnobs],
};

export const defaultCase = () => ({
    components: { ChooseCredentials },
    template: `<div>
                <ChooseCredentials style="width: 80vw;
                                          border: 1px solid plum;
                                          background-color: white;"
                  :items="items"
                  :fields="fields"  
                  :totalCount="totalCount"
                  :loading="loading"
                />
</div>`,
    setup(...args) {
        const items = ref([]);
        const totalCount = ref(0);
        const loading = ref(true);

        /**
         * @name listCredentials
         * @param query {Object}
         */
        const listCredentials = (query) => {
            loading.value = true;
            items.value = [];
            setTimeout(() => {
                totalCount.value = casual.integer(10, 100);
                items.value = arrayOf(query.page.limit, casual._credential);
                loading.value = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        /**
         * @name listCredentialsGroup
         * @param query {Object}
         */
        const listCredentialsGroup = (query) => {
            loading.value = true;
            items.value = [];
            setTimeout(() => {
                totalCount.value = casual.integer(10, 100);
                items.value = arrayOf(query.page.limit, casual._credential);
                loading.value = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);

        return {
            plugin: ref(casual.pluginInfo),
            items,
            totalCount,
            loading,
            fields: ['credential_id', 'name', 'issue_type', 'credential_groups'],
        };
    },
});
