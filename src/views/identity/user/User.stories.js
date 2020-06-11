import { action } from '@storybook/addon-actions';
import User from './User.template.vue';
import casual from '@/views/identity/user/models/user-model';
import { arrayOf } from '@/lib/casual';


export default {
    title: 'views/identity/user',
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
    extends: User,
    computed: {
        items() {
            return arrayOf(this.pageSize, casual._user);
        },
    },
});
