import { action } from '@storybook/addon-actions';
import User from './User.template';
import casual from '@/views/identity/user/models/user-model';
import PStatus from '@/components/molecules/status/Status';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'view/identity/user',
    component: User,
    parameters: {
        info: {
            summary: '',
            components: { User },
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
    template: `${User.template}`,
    components: {
        PStatus,
        BaseDragHorizontal,
        PToolboxTable,
        PButton,
    },
    mixins: [User],
    computed: {
        items() {
            return arrayOf(this.pageSize, casual._user);
        },
    },
});
