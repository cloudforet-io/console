import PListItem from './ListItem';
import { autoProps } from '@sb/storybook-util';


export default {
    title: 'Molecules/list-items',
    component: PListItem,
};


export const defaultCase = () => ({
    components: { PListItem },
    props: {
        ...autoProps(PListItem),
    },
    template: '<p-list-item :contents="contents" :indent="indent"/>',
});
