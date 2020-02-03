import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import CollectorDetail from './CollectorDetail.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/inventory/collector/modules/CollectorDetail',
    component: CollectorDetail,
    parameters: {
        info: {
            summary: '',
            components: { CollectorDetail },
        },
    },
};

export const defaultCase = () => ({
    components: { CollectorDetail },
    template: '<collector-detail :item="collector" />',
    setup(props, context) {
        mountBusEvent(CollectorEventBus, 'confirmTags', action('confirmTags'));
        return {
            collector: ref(casual.collector),
        };
    },
});
