import { action } from '@storybook/addon-actions';
import Credentials from '@/views/secret/credentials/Credentials.template.vue';
import casual from '@/views/identity/user/models/user-model';
import PStatus from '@/components/molecules/status/Status.vue';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'view/identity/user',
    component: Credentials,
    parameters: {
        info: {
            summary: '',
            components: { Credentials },
        },
    },
};
const actions = {
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
    clickRefresh() {
        return action('clickRefresh');
    },
};


export const template = () => ({
    template: `${Credentials.template}`,
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
    },
    mixins: [Credentials],
    computed: {
        items() {
            return arrayOf(this.pageSize, casual._user);
        },
    },
});
