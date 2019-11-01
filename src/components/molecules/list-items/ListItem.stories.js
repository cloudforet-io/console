import ListItem from './ListItem.vue';
import { autoProps } from '@/setup/storybook-util';


export default {
    title: 'Molecules/list-items',
    component: ListItem,
};


export const defaultCase = () => ({
    components: { 'p-list-item': ListItem },
    props: {
        ...autoProps(ListItem),
    },
    template: '<p-list-item :contents="contents" :indent="indent"/>',
});
