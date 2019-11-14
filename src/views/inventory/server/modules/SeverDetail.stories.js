import { action } from '@storybook/addon-actions';
import { ref } from '@vue/composition-api';
import PSeverDetail from '@/views/inventory/server/modules/ServerDetail';
import casual from '@/views/inventory/server/models/server-model';

export default {
    title: 'view/inventory/server/modules/detail',
    component: PSeverDetail,
    parameters: {
        info: {
            summary: '',
            components: { PSeverDetail },
        },
    },
};


export const detail = () => ({
    components: { PSeverDetail },
    template: `
<div style="width: 80vw;">
    <PSeverDetail :item="item" :tags.sync="tags" @confirm="confirm"></PSeverDetail>
</div>
`,
    setup() {
        const item = ref(casual._server());
        const tags = ref(item.value.tags);
        console.log('storybook setup',item, tags);
        return {
            item,
            tags,
            confirm() { action('confirm'); },
        };
    },
});
