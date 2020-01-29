import { withKnobs, object } from '@storybook/addon-knobs/vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import ChooseCredentials, { crdState } from './ChooseCredentials.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';
import { defaultQuery } from '@/lib/api';


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
                />
</div>`,
    setup(...args) {
        const listCredentials = () => {
            crdState.loading = true;
            crdState.items = [];
            setTimeout(() => {
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        const listCredentialsGroup = () => {
            crdState.loading = true;
            crdState.items = [];
            setTimeout(() => {
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(crdState.query.page.limit, casual._credential);
                crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentialsGroup', listCredentialsGroup);

        return {
        };
    },
});
