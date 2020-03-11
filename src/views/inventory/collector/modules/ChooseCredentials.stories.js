import { withKnobs, object } from '@storybook/addon-knobs/vue';
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import ChooseCredentials from './ChooseCredentials.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { arrayOf } from '@/lib/casual';
import {defaultQuery} from "@/lib/api/query";


export default {
    title: 'views/inventory/collector/modules/ChooseCredentials',
    component: ChooseCredentials,
    decorators: [withKnobs],
};

export const defaultCase = () => ({
    components: { ChooseCredentials },
    template: `<div>
        <choose-credentials ref="crd"
                            :items="crdState.items"
                            :total-count="crdState.totalCount"
                            :loading="crdState.loading"
                            :crd-type.sync="crdState.crdType"
                            :select-index.sync="crdState.selectIndex"
                            @changeValidState="changeValidState"
        />
</div>`,
    setup(...args) {
        const crdState = reactive({
            items: [],
            totalCount: 0,
            loading: true,
            crdType: 'Credentials',
            selectIndex: [],
        });

        const listCredentials = (params) => {
            crdState.loading = true;
            crdState.items = [];
            setTimeout(() => {
                crdState.totalCount = casual.integer(10, 100);
                crdState.items = arrayOf(params.query.page.limit, casual._credential);
                crdState.loading = false;
            }, casual.integer(1000, 3000));
        };
        mountBusEvent(CollectorEventBus, 'listCredentials', listCredentials);

        return {
            crdState,
            changeValidState: action('changeValidState'),
        };
    },
});
